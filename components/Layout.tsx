
import React, { useState } from 'react';
import { AppView, UserState } from '../types';
import ProgressionStats from './ProgressionStats';
import Avatar from './Avatar';
import { soundService } from '../services/soundService';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
  userState: UserState;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, userState }) => {
  const [isMuted, setIsMuted] = useState(soundService.isMuted());

  const navItems = [
    { view: AppView.HOME, label: 'Início', emoji: '🏠' },
    { view: AppView.DASHBOARD, label: 'Painel', emoji: '📊' },
    { view: AppView.POMODORO, label: 'Foco', emoji: '⏱️' },
    { view: AppView.CORRECTION, label: 'Treino ✍️', emoji: '' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-8 sticky top-0 z-[60] flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView(AppView.HOME)}>
          <div className="w-10 h-10 bg-diplomatBlue rounded-2xl flex items-center justify-center font-black text-brandPink shadow-lg group-hover:scale-110 transition-transform">🐾</div>
          <h1 className="text-xl font-black tracking-tighter uppercase text-diplomatBlue hidden sm:block">Iniciativa <span className="text-rose-400">Diplomática</span></h1>
        </div>
        
        <div className="flex items-center gap-6">
          <ProgressionStats userState={userState} />
          <button 
            onClick={() => {
              const newVal = !isMuted;
              soundService.setMuted(newVal);
              setIsMuted(newVal);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 text-slate-400 hover:text-rose-400 transition-colors"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <div onClick={() => setView(AppView.HOME)} className="cursor-pointer hover:scale-105 transition-transform">
            <Avatar level={userState.level} size="sm" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 pb-32">
        {children}
      </main>

      {/* Floating Dock Navigation */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-diplomatBlue/90 backdrop-blur-2xl rounded-full dock-shadow border border-white/10 flex items-center gap-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => {
              setView(item.view);
              soundService.playMeow();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all text-xs font-black uppercase tracking-widest ${
              currentView === item.view 
                ? 'bg-rose-400 text-diplomatBlue shadow-lg scale-110' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm">{item.emoji}</span>
            {item.label && <span className={currentView === item.view ? 'block' : 'hidden'}>{item.label}</span>}
          </button>
        ))}
      </div>

      <footer className="py-12 text-center opacity-20">
        <div className="text-diplomatBlue font-black uppercase text-[9px] tracking-[0.5em]">
          DIPLOMATCAT • THE DIPLOMATIC INITIATIVE OS 🐾
        </div>
      </footer>
    </div>
  );
};

export default Layout;
