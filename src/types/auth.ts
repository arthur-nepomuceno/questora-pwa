export interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  totalPoints: number;
  totalCorrect: number;
  totalWrong: number;
  moedas: number;
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


export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  totalCorrect: number;
  rank: number;
}
