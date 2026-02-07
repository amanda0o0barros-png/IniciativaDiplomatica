
import React from 'react';
import { SYLLABUS, SUBJECTS } from '../syllabusData';
import { UserState, TopicProgress } from '../types';
import { explainSubject } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface EditalTrackerProps {
  userState: UserState;
  onUpdate: (topicId: string, progress: Partial<TopicProgress>, xpGain: number) => void;
}

const EditalTracker: React.FC<EditalTrackerProps> = ({ userState, onUpdate }) => {
  const [activeSubject, setActiveSubject] = React.useState(SUBJECTS[0]);
  const [explainingId, setExplainingId] = React.useState<string | null>(null);
  const [explanation, setExplanation] = React.useState<{title: string, content: string} | null>(null);

  const handleToggle = (id: string, field: 'theory' | 'flashcards', currentVal: boolean) => {
    const xp = field === 'theory' ? 50 : 30;
    const becomingActive = !currentVal;
    
    if (becomingActive) {
      soundService.playMeow();
    }

    onUpdate(id, { 
      [field]: becomingActive,
      lastStudyDate: becomingActive ? new Date().toISOString() : userState.editalProgress[id]?.lastStudyDate
    }, becomingActive ? xp : 0);
  };

  const handleNumeric = (id: string, field: 'questionsCount' | 'accuracy' | 'studyMinutes', val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    onUpdate(id, { 
      [field]: num,
      lastStudyDate: new Date().toISOString()
    }, 0);
  };

  const handleHelp = async (item: typeof SYLLABUS[0]) => {
    setExplainingId(item.id);
    try {
      const text = await explainSubject(item.subject, item.subtopic);
      setExplanation({ title: `${item.subject}: ${item.subtopic}`, content: text });
    } catch (e) {
      alert("Miau! Tive um problema ao consultar meus alfarrábios.");
    } finally {
      setExplainingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white p-10 rounded-4xl border-2 border-brandPink/20 text-center relative overflow-hidden">
        <h2 className="text-4xl font-extrabold tracking-tighter text-slate-800 uppercase italic">Mapa de Missões 🐾</h2>
        <p className="text-slate-400 font-medium text-sm mt-2">Dossiê completo verticalizado para sua aprovação</p>
        <div className="absolute -bottom-2 -right-2 text-6xl opacity-10 rotate-12">🐱</div>
        <div className="absolute -top-2 -left-2 text-6xl opacity-10 -rotate-12">🐈</div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {SUBJECTS.map(s => (
          <button
            key={s}
            onClick={() => setActiveSubject(s)}
            className={`px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all ${
              activeSubject === s 
                ? 'bg-slate-800 text-white shadow-lg' 
                : 'bg-white text-slate-400 hover:text-slate-700 border border-brandPink/10'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="soft-card rounded-4xl overflow-hidden bg-white/70 backdrop-blur-sm">
        <table className="w-full text-left">
          <thead className="bg-brandPink/10 text-[10px] font-bold uppercase text-rose-400 tracking-widest border-b border-brandPink/5">
            <tr>
              <th className="p-6">Ponto do Edital</th>
              <th className="p-6 text-center w-24">Peso</th>
              <th className="p-6 text-center w-20">Lido</th>
              <th className="p-6 text-center w-24">Ronrom (min)</th>
              <th className="p-6 text-center w-24">Questões</th>
              <th className="p-6 text-center w-24">Acerto (%)</th>
              <th className="p-6 text-center w-20">Mentor</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {SYLLABUS.filter(item => item.subject === activeSubject).map((item) => {
              const prog = userState.editalProgress[item.id] || { theory: false, questionsCount: 0, accuracy: 0, flashcards: false, studyMinutes: 0 };
              return (
                <tr key={item.id} className="border-b border-brandPink/5 hover:bg-brandPink/5 transition-colors">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-brandTeal/80 uppercase mb-0.5">{item.topic}</span>
                      <h4 className="font-bold text-slate-700 leading-tight mb-1">{item.subtopic}</h4>
                      <p className="text-[10px] text-slate-400 italic leading-snug">{item.description}</p>
                      {prog.lastStudyDate && (
                        <div className="mt-2 text-[8px] font-bold text-brandPink uppercase flex items-center gap-1">
                          <span className="text-xs">📅</span> Visto em: {new Date(prog.lastStudyDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase ${
                      item.incidence === 'Alta' ? 'bg-rose-100 text-rose-500' : 'bg-brandGold text-orange-600'
                    }`}>
                      {item.incidence}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <button 
                      onClick={() => handleToggle(item.id, 'theory', prog.theory)}
                      className={`w-10 h-10 rounded-2xl border transition-all flex items-center justify-center text-xl ${
                        prog.theory ? 'bg-brandTeal text-teal-700 border-teal-200' : 'bg-white border-slate-100 text-slate-200'
                      }`}
                    >
                      {prog.theory ? '🐾' : '○'}
                    </button>
                  </td>
                  <td className="p-6">
                    <input 
                      type="number"
                      value={prog.studyMinutes || ''}
                      placeholder="0"
                      onChange={(e) => handleNumeric(item.id, 'studyMinutes', e.target.value)}
                      className="w-full bg-white/50 border border-slate-100 p-2 rounded-xl text-center font-bold text-slate-600 focus:border-brandPink outline-none"
                    />
                  </td>
                  <td className="p-6">
                    <input 
                      type="number"
                      value={prog.questionsCount || ''}
                      placeholder="0"
                      onChange={(e) => handleNumeric(item.id, 'questionsCount', e.target.value)}
                      className="w-full bg-white/50 border border-slate-100 p-2 rounded-xl text-center font-bold text-slate-600 outline-none"
                    />
                  </td>
                  <td className="p-6">
                    <input 
                      type="number"
                      value={prog.accuracy || ''}
                      placeholder="0"
                      onChange={(e) => handleNumeric(item.id, 'accuracy', e.target.value)}
                      className={`w-full border p-2 rounded-xl text-center font-bold outline-none transition-all ${
                        prog.accuracy >= 70 ? 'bg-brandTeal/20 border-teal-300 text-teal-700' : 'bg-white border-slate-100 text-slate-600'
                      }`}
                    />
                  </td>
                  <td className="p-6 text-center">
                    <button 
                      onClick={() => handleHelp(item)}
                      disabled={explainingId === item.id}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all border ${
                        explainingId === item.id ? 'bg-slate-100' : 'bg-brandGold border-orange-200 hover:scale-110 active:scale-95 text-orange-600'
                      }`}
                      title="Pedir ajuda ao Mentor"
                    >
                      {explainingId === item.id ? <span className="animate-spin text-xs">🐱</span> : '💡'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Explanation Modal */}
      {explanation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6 overflow-y-auto">
          <div className="bg-white p-10 rounded-4xl max-w-2xl w-full space-y-6 shadow-2xl animate-[scaleIn_0.3s_ease-out]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-400 tracking-[0.2em]">Consultoria Express</span>
                <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">{explanation.title}</h3>
              </div>
              <button onClick={() => setExplanation(null)} className="text-slate-300 hover:text-slate-500 transition-colors text-2xl">✕</button>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
              {explanation.content}
            </div>
            <div className="pt-6 border-t border-brandPink/10">
              <button 
                onClick={() => setExplanation(null)}
                className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-slate-700"
              >
                Entendido, Mentor! 🐾
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditalTracker;
