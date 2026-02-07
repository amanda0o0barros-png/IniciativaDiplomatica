
import React, { useState, useCallback, useEffect } from 'react';
import { AppView, CorrectionResult, PracticeQuestion, UserState, TopicProgress, DossierHighlight } from './types';
import { correctEssay, generateQuestion, getWeeklyDiplomaticDossier } from './services/geminiService';
import { soundService } from './services/soundService';
import Layout from './components/Layout';
import Avatar from './components/Avatar';
import Dashboard from './components/Dashboard';
import PomodoroTimer from './components/PomodoroTimer';
import ScheduleGenerator from './components/ScheduleGenerator';
import ChatMentor from './components/ChatMentor';
import PracticeArea from './components/PracticeArea';
import CorrectionResultView from './components/CorrectionResultView';
import { SYLLABUS } from './syllabusData';

const STORAGE_KEY = 'iniciativa_diplomat_v1.0';

const INITIAL_USER_STATE: UserState = {
  xp: 0,
  level: 1,
  submissionsCount: 0,
  unlockedRewardIds: [],
  editalProgress: {},
  studyCycle: [],
  currentCycleIndex: 0
};

export default function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [lastResult, setLastResult] = useState<CorrectionResult | null>(null);
  const [userState, setUserState] = useState<UserState>(INITIAL_USER_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [dossierHighlights, setDossierHighlights] = useState<DossierHighlight[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) try { 
      const parsed = JSON.parse(saved);
      setUserState({ ...INITIAL_USER_STATE, ...parsed }); 
    } catch (e) {}

    // Fetch news for the home card
    getWeeklyDiplomaticDossier().then(data => {
      setDossierHighlights(data.highlights);
    }).catch(() => {
      setDossierHighlights([
        { text: "Itamaraty monitora cúpulas regionais" },
        { text: "Acordos de cooperação em debate no G20" },
        { text: "Brasil amplia presença em fóruns multilaterais" }
      ]);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userState));
  }, [userState]);

  const addXp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setUserState(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let nextLevelXp = newLevel * 200;
      let leveledUp = false;
      while (newXp >= nextLevelXp) {
        newXp -= nextLevelXp;
        newLevel += 1;
        nextLevelXp = newLevel * 200;
        leveledUp = true;
      }
      if (leveledUp) soundService.playLevelUp();
      return { ...prev, xp: newXp, level: newLevel };
    });
  }, []);

  const handleUpdateEdital = (id: string, progress: Partial<TopicProgress>, xp: number) => {
    setUserState(prev => ({
      ...prev,
      editalProgress: {
        ...prev.editalProgress,
        [id]: { ...(prev.editalProgress[id] || { theory: false, questionsCount: 0, accuracy: 0, flashcards: false, studyMinutes: 0 }), ...progress }
      }
    }));
    addXp(xp);
  };

  const handleStudyMinutes = (id: string, minutes: number) => {
    setUserState(prev => {
      const current = prev.editalProgress[id] || { theory: false, questionsCount: 0, accuracy: 0, flashcards: false, studyMinutes: 0 };
      return {
        ...prev,
        editalProgress: {
          ...prev.editalProgress,
          [id]: { 
            ...current, 
            studyMinutes: (current.studyMinutes || 0) + minutes,
            lastStudyDate: new Date().toISOString()
          }
        }
      };
    });
    addXp(Math.floor(minutes / 2));
  };

  // Fixed type casting for Object.values to avoid 'unknown' errors
  const totalStudyMinutes = (Object.values(userState.editalProgress) as TopicProgress[]).reduce((acc, p) => acc + (p.studyMinutes || 0), 0);
  const totalHours = (totalStudyMinutes / 60).toFixed(1);
  const readTopicsCount = (Object.values(userState.editalProgress) as TopicProgress[]).filter(p => p.theory).length;
  const totalTopics = SYLLABUS.length;
  const coveragePercent = ((readTopicsCount / totalTopics) * 100).toFixed(0);

  const getDailyMissions = () => {
    const day = new Date().getDay();
    const plan: Record<number, string[]> = {
      1: ['Economia', 'Língua Inglesa', 'História do Brasil'],
      2: ['Direito', 'Língua Portuguesa', 'Política Internacional'],
      3: ['História Mundial', 'Economia', 'Língua Francesa'],
      4: ['Direito', 'Geografia', 'Língua Portuguesa'],
      5: ['Política Internacional', 'História Mundial', 'Economia'],
      6: ['Língua Inglesa', 'História do Brasil', 'Direito'],
      0: []
    };
    const subjects = plan[day] || [];
    return subjects.map(sub => {
      const found = SYLLABUS.find(item => {
        const isMatch = sub === 'Direito' ? item.subject.includes('Direito') : item.subject === sub;
        return isMatch && !userState.editalProgress[item.id]?.theory;
      });
      return { subject: sub, topic: found };
    });
  };

  const dailyMissions = getDailyMissions();

  const renderView = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[70vh] space-y-12">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-brandPink border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-5xl animate-float">🐈</div>
        </div>
        <div className="text-center space-y-4">
          <h3 className="text-diplomatBlue font-black uppercase text-sm tracking-[0.5em] animate-pulse italic">
            Processando Inteligência
          </h3>
          <p className="text-slate-400 font-serif italic text-base">O Mentor Cat está datilografando sua análise...</p>
        </div>
      </div>
    );

    switch(view) {
      case AppView.HOME: return (
        <div className="space-y-12 max-w-7xl mx-auto pb-32 animate-[fadeIn_0.8s_ease-out]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Hero Card */}
            <div className="lg:col-span-8 glass-card p-12 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
              <div className="relative shrink-0">
                <Avatar level={userState.level} size="lg" />
                <div className="absolute -bottom-2 -right-2 bg-diplomatBlue text-brandPink w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-2xl rotate-12">🎖️</div>
              </div>
              <div className="flex-1 space-y-6 text-center md:text-left z-10">
                <div className="space-y-2">
                  <span className="text-xs font-black text-rose-400 uppercase tracking-[0.4em]">Iniciativa Diplomática v1.0</span>
                  <h2 className="text-7xl font-black text-diplomatBlue tracking-tighter italic leading-[0.9]">Seja bem-vindo,<br/><span className="text-rose-400">Diplomata</span></h2>
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-white/50 px-6 py-3 rounded-3xl border border-white/40 flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <span className="text-xs font-bold text-slate-600">Cobertura: <span className="text-diplomatBlue font-black">{coveragePercent}%</span></span>
                  </div>
                  <div className="bg-white/50 px-6 py-3 rounded-3xl border border-white/40 flex items-center gap-3">
                    <span className="text-xl">✨</span>
                    <span className="text-xs font-bold text-slate-600">XP Total: <span className="text-diplomatBlue font-black">{userState.xp}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Foco Timer Card */}
            <div className="lg:col-span-4 bg-diplomatBlue rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden group">
               <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">⏳</div>
               <div className="space-y-1">
                  <span className="text-7xl font-black text-white tracking-tighter">{totalHours}</span>
                  <p className="text-[11px] font-black text-rose-300 uppercase tracking-[0.4em]">Horas Estudadas</p>
               </div>
               <button onClick={() => setView(AppView.POMODORO)} className="w-full bg-rose-400 text-diplomatBlue py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-rose-300 transition-all">
                 Entrar em Foco ⏱️
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Daily Missions */}
            <div className="md:col-span-7 sticker-card bg-white p-12 rounded-[3.5rem] flex flex-col gap-8 shadow-sm relative overflow-hidden min-h-[500px]">
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-12 h-12 bg-slate-800 text-brandPink rounded-2xl flex items-center justify-center text-2xl shadow-lg">📂</div>
                 <div>
                   <h3 className="text-2xl font-black text-diplomatBlue uppercase italic leading-none tracking-tight">Agenda Tática</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Missões prioritárias de hoje</p>
                 </div>
               </div>
               <div className="space-y-4 relative z-10 flex-1">
                 {dailyMissions.map((m, idx) => (
                   <div 
                    key={idx} 
                    onClick={() => setView(AppView.DASHBOARD)}
                    className="group/card bg-slate-50 hover:bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-brandPink/30 hover:shadow-xl hover:shadow-brandPink/5 transition-all cursor-pointer flex items-center gap-6"
                   >
                     <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl group-hover/card:rotate-12 transition-transform">
                       {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                     </div>
                     <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">{m.subject}</span>
                          {m.topic && (
                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${
                              m.topic.incidence === 'Alta' ? 'bg-rose-500 text-white' : 'bg-brandGold text-orange-800'
                            }`}>{m.topic.incidence}</span>
                          )}
                        </div>
                        <h4 className="text-lg font-black text-diplomatBlue leading-tight font-serif italic group-hover/card:text-rose-400 transition-colors">
                          {m.topic ? m.topic.subtopic : 'Conclua para ver a próxima'}
                        </h4>
                     </div>
                   </div>
                 ))}
               </div>
               <button onClick={() => setView(AppView.DASHBOARD)} className="w-full bg-slate-800 text-brandPink py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                  Abrir Mapa de Missões Integral
               </button>
            </div>

            {/* News and Training */}
            <div className="md:col-span-5 flex flex-col gap-8">
               {/* NEWS DOSSIER CARD */}
               <div className="flex-1 sticker-card bg-brandGold p-10 rounded-[3rem] relative overflow-hidden border border-orange-200/50">
                  <div className="absolute top-8 right-8 text-5xl opacity-10">📡</div>
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
                      <h3 className="text-3xl font-black text-orange-950 uppercase italic tracking-tighter leading-none">Manchetes PEB</h3>
                    </div>
                    <div className="space-y-3">
                       <div className="space-y-3">
                          {dossierHighlights.length > 0 ? dossierHighlights.map((h, i) => (
                            <div key={i} className="bg-white/40 p-4 rounded-2xl border border-orange-900/5 text-xs font-black text-orange-900 leading-tight group/link transition-all hover:bg-white/60">
                               <div className="flex flex-col gap-2">
                                 <span className="line-clamp-2">{h.text}</span>
                                 {h.url && (
                                   <a 
                                    href={h.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[9px] font-black uppercase text-orange-700 border-b border-orange-200 w-fit hover:border-orange-700 transition-all"
                                   >
                                     Ler no portal ↗
                                   </a>
                                 )}
                               </div>
                            </div>
                          )) : (
                            <div className="animate-pulse space-y-3">
                               <div className="h-12 bg-orange-900/5 rounded-2xl w-full"></div>
                               <div className="h-12 bg-orange-900/5 rounded-2xl w-full"></div>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
               </div>
               
               {/* TRAINING CARD */}
               <div onClick={() => setView(AppView.CORRECTION)} className="flex-1 sticker-card bg-white p-10 rounded-[3rem] cursor-pointer relative overflow-hidden group border-4 border-dashed border-brandTeal/30 hover:border-brandTeal shadow-2xl shadow-brandTeal/5">
                  <div className="absolute top-8 right-8 text-5xl opacity-10 group-hover:-rotate-12 transition-all">✒️</div>
                  <div className="space-y-3">
                    <span className="px-4 py-1 bg-brandTeal/20 text-teal-700 rounded-full text-[9px] font-black uppercase tracking-widest">Fase Discursiva</span>
                    <h3 className="text-3xl font-black text-diplomatBlue uppercase italic tracking-tighter leading-none">Simulado IRBr</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">Laboratório de escrita com correção IA rigorosa.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      );
      case AppView.DASHBOARD: return <Dashboard userState={userState} setView={setView} onUpdateEdital={handleUpdateEdital} />;
      case AppView.POMODORO: return <PomodoroTimer onStudyComplete={handleStudyMinutes} />;
      case AppView.SCHEDULE: return <ScheduleGenerator userState={userState} />;
      case AppView.CHAT: return <ChatMentor />;
      case AppView.CORRECTION: return <PracticeArea onStart={(s) => {
        setIsLoading(true);
        generateQuestion(s).then(q => { setCurrentQuestion(q); setView(AppView.PRACTICE); }).finally(() => setIsLoading(false));
      }} />;
      case AppView.PRACTICE: return <PracticeArea question={currentQuestion} onSubmit={(e) => {
        setIsLoading(true);
        correctEssay(currentQuestion!.topic, e).then(r => { 
          setLastResult(r); 
          addXp(100); 
          setView(AppView.RESULT); 
        }).finally(() => setIsLoading(false));
      }} />;
      case AppView.RESULT: return <CorrectionResultView result={lastResult!} onReset={() => setView(AppView.HOME)} />;
      default: return <div onClick={() => setView(AppView.HOME)}>Página não encontrada. Miau!</div>;
    }
  };

  return (
  <div style={{ zoom: "0.9" }}> {/* Diminui tudo em 10% mantendo a proporção */}
    <Layout currentView={view} setView={setView} userState={userState}>
      <div className="px-4"> {/* Dá um respiro nas laterais para não grudar na borda */}
        {renderView()}
      </div>
    </Layout>
  </div>
);
