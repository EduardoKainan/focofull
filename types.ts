
export interface Profile {
  id: string;
  fullName: string;
  energyLevel: number;
  difficulties: string[];
  onboardingCompleted: boolean;
}

export type ReminderType = 'fixed_window' | 'random' | 'none';

export interface Habit {
  id: string;
  name: string;
  microAction: string;
  completedToday: boolean;
  icon: string;
  projectId?: string;
  reminder?: {
    type: ReminderType;
    windowStart?: string;
    windowEnd?: string;
    frequency?: number;
  };
}

export interface Task {
  id: string;
  title: string;
  nextStep: string;
  block: 'morning' | 'afternoon' | 'evening';
  status: 'pending' | 'done';
}

export interface WorkTask {
  id: string;
  title: string;
  description: string;
  energyRequired: 1 | 2 | 3; // 1: Baixa (E-mail), 2: Média (Reunião), 3: Alta (Deep Work)
  status: 'pending' | 'doing' | 'done';
  deadline?: string;
  microSteps?: string[];
}

export interface Project {
  id: string;
  name: string;
  nextAction: string;
  status: 'active' | 'completed';
  reminder?: {
    type: ReminderType;
    windowStart?: string;
    windowEnd?: string;
  };
}

export interface DailyStat {
  date: string;
  points: number;
  tasksDone: number;
  energy: number;
  focusMinutes: number;
}

export interface GamificationState {
  glowPoints: number;
  level: number;
  unlockedElements: string[];
  lastActionDate: string;
  history: DailyStat[];
}

export type Screen = 'auth' | 'onboarding' | 'home' | 'habits' | 'projects' | 'focus' | 'garden' | 'evolution' | 'work';
