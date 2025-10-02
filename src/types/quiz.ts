export interface Question {
  id: number;
  categoria: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  pergunta: string;
  opcoes: string[];
  correta: string;
  pontuacao: number;
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
  creditsAfterDebit?: number;
  creditsAlreadyRecalculated?: boolean;
  totalPoints: number;
}

export interface UserAnswer {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
}

export type Screen = 'modalidade' | 'start' | 'credits' | 'quiz' | 'results' | 'review' | 'coming-soon' | 'auth' | 'options' | 'calculations' | 'ranking';
