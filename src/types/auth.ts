export interface User {
  id: number;
  google_id: string;
  email: string;
  nome: string | null;
  foto_perfil: string | null;
  provider: string;
  creditos: number;
  criado_em: string;
  ultimo_login: string | null;
}

export interface Partida {
  id: number;
  usuario_id: number;
  acertos: number;
  erros: number;
  creditos_ganhos: number;
  creditos_final: number;
  criado_em: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  nome: string;
}
