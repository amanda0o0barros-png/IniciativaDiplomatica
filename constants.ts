
import { Reward } from './types';

export interface DiplomatRank {
  level: number;
  title: string;
  emoji: string;
  color: string;
  accessory: string;
  aura: string;
}

export const DIPLOMAT_LEVELS: DiplomatRank[] = [
  { 
    level: 1, 
    title: 'Aspirante Felino', 
    emoji: '🐱', 
    color: 'bg-slate-100', 
    accessory: '🐾', 
    aura: 'shadow-none' 
  },
  { 
    level: 2, 
    title: 'Terceiro Secretário', 
    emoji: '🐈', 
    color: 'bg-brandPink', 
    accessory: '🎀', 
    aura: 'shadow-[0_0_15px_rgba(255,176,176,0.5)]' 
  },
  { 
    level: 3, 
    title: 'Segundo Secretário', 
    emoji: '👔', 
    color: 'bg-brandTeal', 
    accessory: '👓', 
    aura: 'shadow-[0_0_20px_rgba(184,228,230,0.6)]' 
  },
  { 
    level: 4, 
    title: 'Primeiro Secretário', 
    emoji: '📜', 
    color: 'bg-brandGold', 
    accessory: '✒️', 
    aura: 'shadow-[0_0_25px_rgba(252,231,186,0.7)]' 
  },
  { 
    level: 5, 
    title: 'Conselheiro', 
    emoji: '🎩', 
    color: 'bg-brandRed', 
    accessory: '🏅', 
    aura: 'shadow-[0_0_30px_rgba(255,153,153,0.8)]' 
  },
  { 
    level: 6, 
    title: 'Ministro de 2ª Classe', 
    emoji: '🎖️', 
    color: 'bg-indigo-100', 
    accessory: '👑', 
    aura: 'shadow-[0_0_35px_rgba(129,140,248,0.9)]' 
  },
  { 
    level: 8, 
    title: 'Embaixador Plenipotenciário', 
    emoji: '💎', 
    color: 'bg-slate-900', 
    accessory: '🌌', 
    aura: 'shadow-[0_0_45px_rgba(15,23,42,1)]' 
  },
];

export const getDiplomatRank = (level: number): DiplomatRank => {
  return [...DIPLOMAT_LEVELS].reverse().find(r => level >= r.level) || DIPLOMAT_LEVELS[0];
};

export const REWARDS: Reward[] = [
  {
    id: 'connectors',
    name: 'Manual de Conectores Diplomáticos',
    description: 'Uma lista exaustiva de conectores para elevar a coesão do texto ao padrão Rio Branco.',
    minLevel: 2,
    category: 'Tecnica',
    content: 'O uso de conectores como "A despeito de", "Por conseguinte", "Em que pese a" e "Concomitantemente" é essencial para a nota de Português e Estrutura...'
  }
];

export const XP_PER_SUBMISSION = 100;
export const XP_BONUS_GOOD_SCORE = 50; 
export const XP_BONUS_EXCELLENT_SCORE = 100;
