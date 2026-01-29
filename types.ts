
export interface User {
    id: string;
    displayName: string;
    realName: string;
    dob: string;
    gender: string;
    location: string;
    bio: string;
    interests: string[];
    religion: string;
    sexualOrientation: string;
    wantsKids: string;
    smokingStatus: string;
    phoneNumber: string;
    humanPhotoUrl: string;
    catPhotoUrl: string;
    irisColor: string;
    dailyStreak: number;
    questions: QuizQuestion[];
    traitAnswers?: { questionId: string; choiceId: string; trait: string }[];
    coreTruth?: string;
}

export interface FrequencyInsight {
    day: number;
    archetype: string;
    summary: string;
    seeking: string;
    shadow: string;
}

export interface FrequencyStats {
    questionId: string;
    distribution: Record<string, number>; // choiceId -> count
    totalParticipants: number;
}

export type QuestionType = 'cat-based' | 'standard';

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    options: QuestionOption[];
}

export interface QuestionOption {
    id: string;
    text: string;
    trait: string;
}

export interface Match {
    id: string;
    users: [string, string];
    compatibilityScore: number;
    sharedTraits: string[];
    status: 'pending' | 'connected' | 'archived';
    createdAt: string;
    targetUser?: User;
}

export interface DailyDrop {
    date: string;
    questionId: string;
    questionText: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

export enum AppScreen {
  LANDING = 'LANDING',
  SETUP_BASICS = 'SETUP_BASICS',
  SETUP_PICK_CAT = 'SETUP_PICK_CAT',
  SETUP_DETAILS = 'SETUP_DETAILS',
  SETUP_QUESTIONS = 'SETUP_QUESTIONS',
  SETUP_CORE = 'SETUP_CORE',
  DAILY_DASHBOARD = 'DAILY_DASHBOARD',
  FREQUENCY_REPORT = 'FREQUENCY_REPORT',
  STATS_BOARD = 'STATS_BOARD',
  EDIT_PROFILE = 'EDIT_PROFILE'
}
