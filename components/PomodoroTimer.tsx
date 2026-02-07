
import React, { useState, useEffect, useRef } from 'react';
import { SYLLABUS } from '../syllabusData';
import { soundService } from '../services/soundService';

interface PomodoroTimerProps {
  onStudyComplete: (topicId: string, minutes: number) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onStudyComplete }) => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const [lastCompletedMinutes, setLastCompletedMinutes] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sincroniza o timeLeft quando o usuário altera as configurações (apenas se não estiver ativo)
  useEffect(() => {
    if (!isActive && timeLeft === (mode === 'work' ? (workMinutes - (workMinutes > 25 ? 0 : 0)) * 60 : breakMinutes * 60)) {
        // Only reset if we haven't started yet. 
        // We use a more robust way below to handle adjustments.
    }
  }, [workMinutes, breakMinutes, mode]);

  const totalTime = mode === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerEnd();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerEnd = () => {
    setIsActive(false);
    soundService.playTimerEnd();
    
    if (mode === 'work') {
      setLastCompletedMinutes(workMinutes);
      setShowFinishedModal(true);
      soundService.playPurr();
      setMode('break');
      setTimeLeft(breakMinutes * 60);
    } else {
      setMode('work');
      setTimeLeft(workMinutes * 60);
      soundService.playMeow();
    }
  };

  const toggleTimer = () => {
    if (mode === 'work' && !selectedTopicId) {
      alert("🐾 Miau! Selecione um tópico do edital primeiro para registrar suas patinhas!");
      return;
    }
    
    const newIsActive = !isActive;
    if (newIsActive) {
      soundService.playMeow();
    }
    setIsActive(newIsActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  };

  const adjustTime = (type: 'work' | 'break', amount: number) => {
    if (isActive) return;
    if (type === 'work') {
      const newVal = Math.max(1, workMinutes + amount);
      setWorkMinutes(newVal);
      if (mode === 'work') setTimeLeft(newVal * 60);
    } else {
      const newVal = Math.max(1, breakMinutes + amount);
      setBreakMinutes(newVal);
      if (mode === 'break') setTimeLeft(newVal * 60);
    }
  };

  const handleConfirmStudy = () => {
    if (selectedTopicId) {
      onStudyComplete(selectedTopicId, lastCompletedMinutes);
      setShowFinishedModal(false);
      soundService.playSuccess();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white p-10 rounded-4xl border-2 border-brandPink/20 text-center relative overflow-hidden shadow-sm">
        <h2 className="text-4xl font-extrabold tracking-tighter text-slate-800 uppercase italic">Cronômetro do Barão ⏱️</h2>
        <p className="text-slate-400 font-medium text-sm mt-2">Foco absoluto para a carreira diplomática</p>
        <div className="absolute -top-4 -right-4 text-6xl opacity-10 rotate-12 select-none">🐾</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Configurações lateral */}
        <div className="space-y-6">
          <div className="soft-card p-6 rounded-3xl bg-white border-2 border-slate-50 space-y-6">
            <h3 className="text-[10px] font-black uppercase text-rose-400 tracking-[0.2em]">Configurar Sessão</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Estudo (min)</span>
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl">
                  <button onClick={() => adjustTime('work', -5)} disabled={isActive} className="w-8 h-8 rounded-xl bg-white shadow-sm font-black text-slate-400 hover:text-brandPink disabled:opacity-30">-</button>
                  <span className="font-black text-slate-700">{workMinutes}</span>
                  <button onClick={() => adjustTime('work', 5)} disabled={isActive} className="w-8 h-8 rounded-xl bg-white shadow-sm font-black text-slate-400 hover:text-brandPink disabled:opacity-30">+</button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Pausa (min)</span>
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl">
                  <button onClick={() => adjustTime('break', -1)} disabled={isActive} className="w-8 h-8 rounded-xl bg-white shadow-sm font-black text-slate-400 hover:text-brandTeal disabled:opacity-30">-</button>
                  <span className="font-black text-slate-700">{breakMinutes}</span>
                  <button onClick={() => adjustTime('break', 1)} disabled={isActive} className="w-8 h-8 rounded-xl bg-white shadow-sm font-black text-slate-400 hover:text-brandTeal disabled:opacity-30">+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="soft-card p-6 rounded-3xl bg-brandGold/10 border-none flex flex-col items-center justify-center gap-4 text-center">
             <div className="text-5xl cat-float select-none">🐈</div>
             <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest leading-relaxed italic">"O sucesso é o ronrom de uma mente disciplinada."</p>
          </div>
        </div>

        {/* Timer principal */}
        <div className="lg:col-span-2 soft-card p-10 rounded-4xl bg-white flex flex-col items-center gap-8 shadow-xl border-2 border-brandPink/10">
          <div className="w-full space-y-2 text-center">
            <label className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Tópico em Missão</label>
            <select 
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={isActive}
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-3xl font-bold text-slate-600 focus:ring-2 focus:ring-brandPink outline-none disabled:opacity-80 appearance-none shadow-inner cursor-pointer text-center"
            >
              <option value="">Selecione o ponto do edital...</option>
              {SYLLABUS.map(item => (
                <option key={item.id} value={item.id}>{item.subject} - {item.subtopic}</option>
              ))}
            </select>
          </div>

          <div className="relative w-72 h-72 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                cx="144" cy="144" r="135" 
                stroke="currentColor" strokeWidth="10" fill="transparent"
                className="text-slate-50"
              />
              <circle 
                cx="144" cy="144" r="135" 
                stroke="currentColor" strokeWidth="10" fill="transparent"
                strokeDasharray={848.23}
                strokeDashoffset={848.23 - (848.23 * progress) / 100}
                className={`transition-all duration-1000 ease-linear ${mode === 'work' ? 'text-brandPink' : 'text-brandTeal'}`}
              />
            </svg>
            <div className="flex flex-col items-center z-10">
              <span className={`text-7xl font-black tracking-tighter drop-shadow-sm ${mode === 'work' ? 'text-slate-800' : 'text-teal-600'}`}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
                {mode === 'work' ? 'Modo Foco' : 'Recalibrar'}
              </span>
              <div className={`mt-6 w-20 h-20 bg-white border-4 border-slate-100 rounded-2xl flex items-center justify-center text-4xl shadow-md rotate-3`}>
                <span className={isActive ? 'animate-bounce' : ''}>
                  {mode === 'work' ? '✍️' : '☕'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <button 
              onClick={toggleTimer}
              className={`flex-1 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                isActive 
                  ? 'bg-slate-100 text-slate-500 border-2 border-slate-200' 
                  : mode === 'work' ? 'bg-slate-800 text-brandPink' : 'bg-brandTeal text-teal-700'
              }`}
            >
              {isActive ? '⏸️ Pausar' : (timeLeft < totalTime ? '▶️ Retomar' : '🚀 Iniciar')}
            </button>
            <button 
              onClick={resetTimer}
              className="px-8 py-6 rounded-3xl border-2 border-slate-100 bg-white text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Conclusão e Registro */}
      {showFinishedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white p-12 rounded-4xl max-w-md w-full text-center space-y-8 shadow-2xl animate-[scaleIn_0.3s_ease-out] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-brandGold"></div>
            
            <div className="w-40 h-40 mx-auto bg-slate-50 border-8 border-white rounded-3xl flex items-center justify-center text-7xl -rotate-6 shadow-2xl">
               🏆
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">Missão Cumprida!</h3>
              <p className="text-slate-400 font-medium text-sm">Você completou <span className="text-rose-400 font-black">{lastCompletedMinutes} minutos</span> de estudo focado.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Destino do Progresso:</span>
              <p className="text-xs font-bold text-slate-700">
                {SYLLABUS.find(s => s.id === selectedTopicId)?.subtopic || 'Geral'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmStudy}
                className="w-full bg-slate-800 text-brandPink py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-slate-700 transition-all active:scale-95"
              >
                Registrar no Edital 🐾
              </button>
              <button 
                onClick={() => setShowFinishedModal(false)}
                className="w-full bg-white text-slate-400 py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest border border-slate-100 hover:bg-slate-50 transition-all"
              >
                Ignorar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
