export interface Question {
  id: number;
  categoria: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  pergunta: string;
  opcoes: string[];
  correta: string;
}

export interface QuizState {
  selectedQuestions: Question[];
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  correctAnswers: number;
  wrongAnswers: number;
  selectedCategory: string | null;
  selectedCredits: number;
  accumulatedScore: number;
  currentMultiplierIndex: number;
  maxErrors: number;
  currentErrors: number;
}

export interface UserAnswer {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
}

export type Screen = 'start' | 'credits' | 'quiz' | 'results' | 'review';
