export interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  totalMatches: number;
  totalScore: number;
  bestScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface Match {
  id: string;
  userId: string;
  category: string;
  score: number;
  creditsUsed: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number;
  createdAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalScore: number;
  totalMatches: number;
  bestScore: number;
  rank: number;
}
