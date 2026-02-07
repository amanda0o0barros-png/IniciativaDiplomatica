
import React from 'react';
import { getDiplomatRank } from '../constants';

interface AvatarProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ level, size = 'md' }) => {
  const rank = getDiplomatRank(level);
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-24 h-24 text-5xl',
    lg: 'w-48 h-48 text-8xl'
  };

  const accessorySize = {
    sm: 'text-xs',
    md: 'text-2xl',
    lg: 'text-5xl'
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={`${sizeClasses[size]} ${rank.color} ${rank.aura} border-4 border-white rounded-4xl flex items-center justify-center relative group transition-all duration-500 shadow-xl`}
      >
        <span className="group-hover:scale-110 transition-transform duration-500 z-10 select-none">
          {rank.emoji}
        </span>
        
        {/* Acessório flutuante */}
        <div className={`absolute -top-1 -right-1 ${accessorySize[size]} bg-white/90 p-1 rounded-full shadow-sm animate-bounce z-20`}>
          {rank.accessory}
        </div>

        {/* Efeito de sticker border */}
        <div className="absolute inset-0 border-[6px] border-white/40 rounded-4xl pointer-events-none z-30"></div>
      </div>
      
      {size !== 'sm' && (
        <div className="flex flex-col items-center mt-4">
          <div className="bg-white px-6 py-2 rounded-full border border-brandPink/10 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 shadow-sm flex items-center gap-2">
            <span className="text-rose-300">Level {level}</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            {rank.title} 🐾
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;
