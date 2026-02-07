
import React from 'react';
import { CorrectionResult } from '../types';

interface CorrectionResultViewProps {
  result: CorrectionResult;
  onReset: () => void;
}

const CorrectionResultView: React.FC<CorrectionResultViewProps> = ({ result, onReset }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white p-12 rounded-[3.5rem] border-2 border-brandPink/10 text-center relative overflow-hidden shadow-sm">
        <h2 className="text-5xl font-black tracking-tighter text-diplomatBlue uppercase italic leading-none">Veredito do Mentor 🐾</h2>
        <p className="text-slate-400 font-medium text-base mt-4">Análise tática e plano de evolução para o Treino de Discursivas</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Sidebar: Score & Stats */}
        <div className="space-y-8">
          <div className="bg-diplomatBlue p-12 rounded-[3rem] text-white text-center space-y-6 shadow-2xl">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brandPink opacity-80">Nota Técnica</span>
             <div className="text-8xl font-black italic tracking-tighter text-brandPink leading-none">
               {result.score.toFixed(2)}
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Padrão IRBr 0.0 a 10.0</p>
          </div>

          <div className="bg-white p-10 rounded-[3rem] space-y-6 shadow-sm border border-slate-50">
            <h4 className="text-[11px] font-black uppercase text-rose-400 tracking-[0.3em]">Méritos Diplomáticos</h4>
            <div className="space-y-4">
              {result.highlights.map((h, i) => (
                <div key={i} className="flex gap-4 text-xs font-bold text-slate-600 leading-relaxed">
                  <span className="text-teal-400 text-lg shrink-0">✓</span> {h}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Feedback Content */}
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-white p-12 rounded-[3.5rem] space-y-10 shadow-sm">
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-diplomatBlue uppercase italic tracking-tight flex items-center gap-4">
                <span className="w-10 h-10 bg-brandGold rounded-2xl flex items-center justify-center text-xl">📄</span> Parecer da Banca
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed italic border-l-[6px] border-brandGold pl-8 text-lg">
                {result.justification}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-slate-50">
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase text-rose-500 tracking-[0.3em]">Erros de Registro</h4>
                <ul className="space-y-3">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-xs font-bold text-slate-400 flex gap-3 leading-relaxed">
                      <span className="text-rose-300">!</span> {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase text-brandTeal tracking-[0.3em]">Lacunas de Conteúdo</h4>
                <ul className="space-y-3">
                  {result.omissions.map((o, i) => (
                    <li key={i} className="text-xs font-bold text-slate-400 flex gap-3 leading-relaxed">
                      <span className="text-teal-300">?</span> {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-brandGold/20 p-12 rounded-[3.5rem] space-y-8">
            <h3 className="text-2xl font-black text-orange-700 uppercase italic tracking-tighter flex items-center gap-4">
              <span className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">🎯</span> Plano de Ajuste Tático
            </h3>
            <div className="grid gap-4">
              {result.improvementPlan.map((step, i) => (
                <div key={i} className="flex gap-6 p-6 bg-white rounded-[2rem] border border-orange-100 shadow-sm items-center">
                   <span className="w-10 h-10 rounded-full bg-orange-700 flex items-center justify-center font-black text-white text-xs shrink-0">{i+1}</span>
                   <p className="text-sm font-bold text-slate-600 flex-1 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] space-y-10 shadow-lg border border-slate-50">
            <div className="flex justify-between items-center border-b border-slate-50 pb-8">
              <h3 className="text-2xl font-black text-diplomatBlue uppercase italic tracking-tighter">Resposta de Referência (10.0)</h3>
              <span className="px-4 py-1 bg-brandPink text-rose-700 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">Padrão Diplomata</span>
            </div>
            <div className="text-slate-700 font-serif leading-relaxed italic whitespace-pre-wrap text-lg">
              {result.modelResponse}
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full py-8 bg-diplomatBlue text-white rounded-[3rem] font-black uppercase text-sm tracking-[0.4em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
          >
            Retornar ao Comando Central 🐾
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorrectionResultView;
