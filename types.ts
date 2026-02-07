
export interface CorrectionResult {
  score: number;
  justification: string;
  errors: string[];
  omissions: string[];
  highlights: string[];
  bankGrade: number;
  approvedGrade: number;
  modelResponse: string;
  improvementPlan: string[];
}

export interface PracticeQuestion {
  topic: string;
  command: string;
  lines: number;
  subject: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  category: 'Tecnica' | 'Guia' | 'Ferramenta';
  content: string;
}

export interface TopicProgress {
  theory: boolean;
  questionsCount: number;
  accuracy: number;
  flashcards: boolean;
  studyMinutes: number;
  lastStudyDate?: string;
}

export interface UserState {
  xp: number;
  level: number;
  submissionsCount: number;
  unlockedRewardIds: string[];
  editalProgress: Record<string, TopicProgress>;
  studyCycle: string[];
  currentCycleIndex: number;
}

export interface SyllabusItem {
  id: string;
  subject: string;
  topic: string;
  subtopic: string;
  description: string;
  incidence: 'Alta' | 'Média' | 'Baixa';
}

export interface DossierHighlight {
  text: string;
  url?: string;
}

export enum AppView {
  HOME = 'HOME',
  CORRECTION = 'CORRECTION',
  PRACTICE = 'PRACTICE',
  RESULT = 'RESULT',
  DASHBOARD = 'DASHBOARD',
  POMODORO = 'POMODORO',
  SCHEDULE = 'SCHEDULE',
  CHAT = 'CHAT'
}
