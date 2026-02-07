
import React, { useState, useEffect } from 'react';
import { getWeeklyDiplomaticDossier, DossierData } from '../services/geminiService';
import { soundService } from '../services/soundService';
import { DossierHighlight } from '../types';

interface DiplomaticResearchProps {
  onUpdateHighlights?: (highlights: DossierHighlight[]) => void;
}

const DiplomaticResearch: React.FC<DiplomaticResearchProps> = ({ onUpdateHighlights }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DossierData | null>(null);

  const fetchDossier = async () => {
    setLoading(true);
    soundService.playMeow();
    try {
      const result = await getWeeklyDiplomaticDossier();
      setData(result);
      if (onUpdateHighlights) onUpdateHighlights(result.highlights);
      soundService.playSuccess();
    } catch (e) {
      console.error(e);
      alert("🐾 Miau! Tivemos um erro ao acessar os canais diplomáticos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data) fetchDossier();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white p-12 rounded-[3.5rem] border-2 border-brandPink/20 text-center relative overflow-hidden shadow-sm">
        <div className="inline-flex items-center gap-2 mb-4">
           <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
           <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Briefing Secreto • Uso Interno</span>
        </div>
        <h2 className="text-5xl font-black tracking-tighter text-diplomatBlue uppercase italic">Dossiê de Inteligência 📡</h2>
        <p className="text-slate-400 font-medium text-base mt-4 max-w-2xl mx-auto">Compilado de Política Externa Brasileira (PEB) com foco nos eixos temáticos do edital Rio Branco.</p>
        
        <button 
          onClick={fetchDossier}
          disabled={loading}
          className="mt-8 px-10 py-4 bg-diplomatBlue text-brandPink rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl"
        >
          {loading ? 'Sincronizando Canais...' : 'Atualizar Briefing do Barão 🐾'}
        </button>
      </div>

      {loading && !data && (
        <div className="flex flex-col items-center justify-center p-24 space-y-8">
          <div className="w-32 h-32 bg-brandPink/10 rounded-full flex items-center justify-center relative shadow-inner">
            <span className="text-6xl cat-float select-none">🐈‍⬛</span>
            <div className="absolute inset-0 border-4 border-brandPink border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 font-black uppercase text-xs tracking-[0.5em] animate-pulse">Varrendo Telegramas do Itamaraty...</p>
        </div>
      )}

      {data && (
        <div className="space-y-12 animate-[fadeIn_0.5s_ease-out]">
          {/* DESTAQUES RÁPIDOS COM LINKS */}
          <div className="grid md:grid-cols-3 gap-6">
             {data.highlights.map((h, i) => (
               <div key={i} className="group/h bg-brandGold p-8 rounded-[2.5rem] border border-orange-200/50 shadow-sm hover:-rotate-2 transition-all flex flex-col h-full">
                  <span className="text-2xl block mb-3">📍</span>
                  <p className="text-sm font-black text-orange-950 leading-tight italic flex-1">{h.text}</p>
                  {h.url && (
                    <a href={h.url} target="_blank" rel="noopener noreferrer" className="mt-4 text-[10px] font-black uppercase text-orange-600 underline flex items-center gap-1">
                      Ver no portal ↗
                    </a>
                  )}
               </div>
             ))}
          </div>

          {/* SEMANA ATUAL */}
          <div className="glass-card p-12 rounded-[4rem] border-none shadow-2xl relative overflow-hidden bg-white/80">
            <div className="absolute top-0 right-0 p-8">
              <span className="bg-brandTeal/30 text-teal-700 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest backdrop-blur-md">Canal Seguro</span>
            </div>
            
            <div className="flex items-center gap-5 border-b border-diplomatBlue/5 pb-8 mb-10">
              <span className="text-4xl">🌎</span>
              <h3 className="text-3xl font-black text-diplomatBlue uppercase italic tracking-tighter">Panorama Diplomático Atual</h3>
            </div>
            
            <div className="text-slate-700 font-medium whitespace-pre-wrap leading-[1.8] text-lg font-sans">
              {data.current}
            </div>
          </div>

          {/* RETROSPECTIVA */}
          <div className="bg-slate-800/90 text-slate-400 p-12 rounded-[4rem] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-5 border-b border-white/5 pb-8 mb-10">
              <span className="text-4xl opacity-50 grayscale">⏳</span>
              <h3 className="text-xl font-black text-slate-500 uppercase italic tracking-tight">Retrospectiva e Análise de Contexto</h3>
            </div>
            
            <div className="text-slate-400 font-medium whitespace-pre-wrap leading-relaxed text-base italic font-sans opacity-80">
              {data.previous}
            </div>
          </div>

          {/* Grounding Sources */}
          {data.sources.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-6">
                <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                <h4 className="text-[11px] font-black uppercase text-rose-400 tracking-[0.4em]">Fontes Primárias e Verificação</h4>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.sources.map((source, idx) => (
                  <a 
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-brandPink transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">🔗</span>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] font-black text-diplomatBlue truncate uppercase tracking-tight">{source.title}</span>
                      <span className="text-[9px] text-slate-400 truncate uppercase tracking-widest mt-1">{new URL(source.uri).hostname}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiplomaticResearch;
