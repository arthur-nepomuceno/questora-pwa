export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  totalCredits: number;
  totalPoints: number;
  totalCorrect: number;
  totalWrong: number;
  moedas: number;
  totalGames: number;
  creditPackage100: number;
  creditPackage500: number;
  creditPackage700: number;
  creditPackage1000: number;
  cpfNumber: string;
  cnpjNumber: string;
  purchaseToken?: string;
  chatId?: number;
  maxScore: number;
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
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}


export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  totalCorrect: number;
  rank: number;
}
