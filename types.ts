
export interface UserAnswer {
  question: string;
  answer: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  originalPhoto: string; // base64
  catPhoto: string; // base64
  catDescription: string;
  eyeColor: string;
  questions: QuizQuestion[];
  deepAnswers: UserAnswer[];
  coreTruth?: string; // The "Looks vs Personality" honest answer
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export enum AppScreen {
  LANDING = 'LANDING',
  SETUP_BASICS = 'SETUP_BASICS',
  SETUP_QUESTIONS = 'SETUP_QUESTIONS',
  SETUP_CORE = 'SETUP_CORE',
  SWIPE = 'SWIPE',
  QUIZ = 'QUIZ',
  MATCHED = 'MATCHED'
}
