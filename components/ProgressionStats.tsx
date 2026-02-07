
import React from 'react';
import { UserState } from '../types';

interface ProgressionStatsProps {
  userState: UserState;
}

const ProgressionStats: React.FC<ProgressionStatsProps> = ({ userState }) => {
  const nextLevelXp = userState.level * 200;
  const progress = (userState.xp / nextLevelXp) * 100;

  return (
    <div className="flex items-center gap-6 bg-white px-6 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex flex-col items-center">
        <span className="text-[9px] uppercase font-black text-slate-400 leading-none mb-1">LVL</span>
        <span className="text-slate-800 font-extrabold text-lg leading-none">{userState.level}</span>
      </div>
      <div className="w-24 md:w-40 h-2 bg-slate-50 rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-gradient-to-r from-brandGold to-brandPink transition-all duration-700 ease-out" 
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
      <div className="flex flex-col text-right">
        <span className="text-[9px] uppercase font-black text-slate-400 leading-none mb-1">XP</span>
        <span className="text-slate-800 font-extrabold text-xs">{userState.xp}</span>
      </div>
    </div>
  );
};

export default ProgressionStats;
