
import React, { useState } from 'react';
import { UserState, TopicProgress } from '../types';
import { SYLLABUS } from '../syllabusData';
import { generateStudySchedule } from '../services/geminiService';

interface ScheduleGeneratorProps {
  userState: UserState;
}

const ScheduleGenerator: React.FC<ScheduleGeneratorProps> = ({ userState }) => {
  const [examDate, setExamDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!examDate) return alert("Miau! Informe a data da prova primeiro.");
    
    setLoading(true);
    try {
      const today = new Date();
      const target = new Date(examDate);
      const diffTime = Math.abs(target.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Build context for AI
      // Fixed type casting for Object.values to avoid 'unknown' errors
      const studiedCount = (Object.values(userState.editalProgress) as TopicProgress[]).filter(p => p.theory).length;
      const totalTopics = SYLLABUS.length;
      const context = `${studiedCount} de ${totalTopics} tópicos lidos. Média de acertos em questões: ${
        ((Object.values(userState.editalProgress) as TopicProgress[]).reduce((a, b) => a + b.accuracy, 0) / Math.max(1, studiedCount)).toFixed(1)
      }%`;

      const result = await generateStudySchedule(diffDays, context);
      setSchedule(result);
    } catch (e) {
      alert("Tivemos um problema na embaixada. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white p-10 rounded-4xl border-2 border-brandPink/20 text-center relative overflow-hidden shadow-sm">
        <h2 className="text-4xl font-extrabold tracking-tighter text-slate-800 uppercase italic">Agenda do Embaixador 📅</h2>
        <p className="text-slate-400 font-medium text-sm mt-2">Cronograma estratégico baseado no tempo restante</p>
        <div className="absolute -top-4 -left-4 text-6xl opacity-10 rotate-12">📝</div>
      </div>

      <div className="soft-card p-10 rounded-4xl bg-white/80 space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase text-rose-400 tracking-widest ml-4">Data da Próxima Prova (TPS ou Discursiva)</label>
            <input 
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-white border border-brandPink/20 p-4 rounded-3xl font-bold text-slate-600 focus:ring-2 focus:ring-brandPink outline-none shadow-sm cursor-pointer"
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`px-10 py-4 rounded-3xl font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-3 ${
              loading ? 'bg-slate-200 text-slate-400' : 'bg-slate-800 text-brandPink hover:bg-slate-700'
            }`}
          >
            {loading ? <span className="animate-spin text-lg">🐾</span> : 'Traçar Plano'}
          </button>
        </div>

        {schedule ? (
          <div className="mt-12 space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📜</span>
              <h3 className="text-2xl font-bold tracking-tight">Seu Cronograma Personalizado</h3>
            </div>
            <div className="bg-slate-50 p-8 rounded-4xl border border-slate-100 prose prose-slate max-w-none text-slate-600 font-medium whitespace-pre-wrap leading-relaxed italic">
              {schedule}
            </div>
            <div className="flex justify-center pt-6">
               <button 
                 onClick={() => window.print()}
                 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-800 flex items-center gap-2"
               >
                 🖨️ Imprimir para o Mural
               </button>
            </div>
          </div>
        ) : !loading && (
          <div className="p-20 text-center space-y-4">
             <span className="text-6xl block opacity-20">🧳</span>
             <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">Aguardando sua data de embarque...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleGenerator;
