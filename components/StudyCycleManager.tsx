
import React, { useState } from 'react';
import { UserState } from '../types';
import { SUBJECTS } from '../syllabusData';
import { soundService } from '../services/soundService';

interface StudyCycleManagerProps {
  userState: UserState;
  onUpdateCycle: (newCycle: string[]) => void;
}

const StudyCycleManager: React.FC<StudyCycleManagerProps> = ({ userState, onUpdateCycle }) => {
  const [localCycle, setLocalCycle] = useState<string[]>(userState.studyCycle || []);

  const addSubject = (subject: string) => {
    setLocalCycle([...localCycle, subject]);
    soundService.playMeow();
  };

  const removeSubject = (index: number) => {
    const next = [...localCycle];
    next.splice(index, 1);
    setLocalCycle(next);
  };

  const saveCycle = () => {
    onUpdateCycle(localCycle);
    soundService.playSuccess();
    alert("🐾 Ciclo de estudos atualizado com sucesso!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white p-10 rounded-4xl border-2 border-brandPink/20 text-center relative overflow-hidden shadow-sm">
        <h2 className="text-4xl font-extrabold tracking-tighter text-slate-800 uppercase italic">Ciclo de Estudos 🔄</h2>
        <p className="text-slate-400 font-medium text-sm mt-2">Defina a ordem das matérias para sua rotina de alta performance</p>
        <div className="absolute -top-4 -right-4 text-6xl opacity-10 rotate-12">♻️</div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="soft-card p-8 rounded-4xl bg-white space-y-6">
          <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tight">Seu Ciclo Atual</h3>
          <div className="space-y-3">
            {localCycle.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-slate-800 text-brandPink flex items-center justify-center font-black text-xs">{idx + 1}</span>
                  <span className="text-sm font-bold text-slate-700">{s}</span>
                </div>
                <button onClick={() => removeSubject(idx)} className="text-rose-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all">
                  ✕
                </button>
              </div>
            ))}
            {localCycle.length === 0 && (
              <p className="text-center py-10 text-slate-300 text-xs italic">Nenhuma matéria no seu ciclo ainda...</p>
            )}
          </div>
          <button 
            onClick={saveCycle}
            className="w-full py-4 bg-slate-800 text-brandPink rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-700 shadow-lg transition-all"
          >
            Salvar Configuração 🐾
          </button>
        </div>

        <div className="soft-card p-8 rounded-4xl bg-brandTeal/10 border-none space-y-6">
          <h3 className="text-lg font-black text-teal-800 uppercase italic tracking-tight">Adicionar Disciplina</h3>
          <div className="grid grid-cols-1 gap-2">
            {SUBJECTS.map(subject => (
              <button
                key={subject}
                onClick={() => addSubject(subject)}
                className="p-4 bg-white rounded-2xl border border-teal-100 text-left text-xs font-bold text-slate-600 hover:border-brandTeal hover:bg-brandTeal/5 transition-all flex items-center justify-between group"
              >
                {subject}
                <span className="opacity-0 group-hover:opacity-100 text-teal-400">+</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCycleManager;
