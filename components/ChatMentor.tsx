
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { soundService } from '../services/soundService';

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';

// Base64 helpers provided in documentation
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const ChatMentor: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'pt' | 'en' | 'fr' | 'es'>('pt');
  
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionRef = useRef({ user: '', model: '' });

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    setIsConnected(false);
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            soundService.playMeow();
            
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextOutRef.current) {
              const ctx = audioContextOutRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Interruptions
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Transcriptions
            if (message.serverContent?.inputTranscription) {
              transcriptionRef.current.user += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              transcriptionRef.current.model += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const uText = transcriptionRef.current.user;
              const mText = transcriptionRef.current.model;
              if (uText || mText) {
                setMessages(prev => [
                  ...prev, 
                  ...(uText ? [{ role: 'user' as const, text: uText }] : []),
                  ...(mText ? [{ role: 'model' as const, text: mText }] : [])
                ]);
              }
              transcriptionRef.current = { user: '', model: '' };
            }
          },
          onclose: () => setIsConnected(false),
          onerror: (e) => console.error(e),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `Você é o Mentor Cat, um diplomata experiente e poliglota. 
            Você deve ajudar o candidato no idioma ${selectedLanguage === 'pt' ? 'Português' : selectedLanguage === 'en' ? 'Inglês' : selectedLanguage === 'fr' ? 'Francês' : 'Espanhol'}. 
            Seu objetivo é praticar conversação diplomática, corrigir erros gramaticais de forma gentil e sugerir termos mais sofisticados (registro culto). 
            Seja encorajador, use um tom formal mas com a personalidade de um gatinho sábio. 
            Se for Inglês ou Francês, converse majoritariamente nesses idiomas.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => { stopSession(); };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white p-10 rounded-4xl border-2 border-brandPink/20 text-center relative overflow-hidden shadow-sm">
        <h2 className="text-4xl font-extrabold tracking-tighter text-slate-800 uppercase italic">Cat Mentor Live 🎙️</h2>
        <p className="text-slate-400 font-medium text-sm mt-2">Pratique idiomas e oratória com o Mentor Cat em tempo real</p>
        <div className="absolute -top-4 -right-4 text-6xl opacity-10 rotate-12">🎤</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Settings & Controls */}
        <div className="space-y-6">
          <div className="soft-card p-6 rounded-3xl bg-white space-y-4">
            <label className="text-[10px] font-black uppercase text-rose-400 tracking-widest block">Idioma da Sessão</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'pt', label: 'Português', flag: '🇧🇷' },
                { id: 'en', label: 'English', flag: '🇺🇸' },
                { id: 'fr', label: 'Français', flag: '🇫🇷' },
                { id: 'es', label: 'Español', flag: '🇪🇸' }
              ].map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id as any)}
                  disabled={isConnected}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedLanguage === lang.id 
                      ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-brandPink'
                  }`}
                >
                  <span>{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={isConnected ? stopSession : startSession}
            disabled={isConnecting}
            className={`w-full py-6 rounded-4xl font-black uppercase text-sm tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
              isConnected 
                ? 'bg-rose-50 text-rose-500 border-2 border-rose-100 hover:bg-rose-100' 
                : 'bg-slate-800 text-brandPink hover:bg-slate-700 active:scale-95'
            }`}
          >
            {isConnecting ? (
              <span className="animate-spin text-2xl">🐱</span>
            ) : isConnected ? (
              <><span>⏹️</span> Encerrar Sessão</>
            ) : (
              <><span>🎙️</span> Iniciar Conversa</>
            )}
          </button>

          {isConnected && (
            <div className="flex flex-col items-center gap-4 p-6 bg-brandTeal/10 rounded-3xl border border-brandTeal/20">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner relative">
                  <span className="text-4xl cat-float">🐈</span>
                  <div className="absolute inset-0 rounded-full border-4 border-brandTeal animate-ping opacity-20"></div>
               </div>
               <p className="text-[10px] font-black uppercase text-teal-600 tracking-widest">Mentor Cat está ouvindo...</p>
            </div>
          )}
        </div>

        {/* Chat History */}
        <div className="lg:col-span-2 soft-card rounded-4xl bg-white/60 p-8 flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30 italic">
                <span className="text-6xl mb-4">🐾</span>
                <p className="text-sm font-medium">As transcrições da sua conversa aparecerão aqui em tempo real.</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-slate-800 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-brandPink/10 text-center">
             <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">A transcrição é gerada automaticamente pelo sistema de áudio nativo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMentor;
