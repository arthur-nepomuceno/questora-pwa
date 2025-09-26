"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginCredentials, SignupCredentials } from '@/types/auth';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState<LoginCredentials & { nome?: string }>({
    email: '',
    password: '',
    nome: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      // O redirecionamento será tratado pelo callback
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (isLogin) {
        await signInWithEmail(credentials as LoginCredentials);
      } else {
        await signUpWithEmail(credentials as SignupCredentials);
      }
      
      onAuthSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎯 SHOW DO MILÊNIO</h1>
          <h2>Competição</h2>
          <p>Faça login para participar da competição e ganhar créditos!</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="auth-methods">
          {/* Google OAuth */}
          <button
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </button>

          <div className="divider">
            <span>ou</span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="email-form">
            {!isLogin && (
              <div className="form-group">
                <input
                  type="text"
                  name="nome"
                  placeholder="Nome completo"
                  value={credentials.nome}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={credentials.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Senha"
                value={credentials.password}
                onChange={handleInputChange}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="email-auth-btn"
              disabled={loading}
            >
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button
                type="button"
                className="switch-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setCredentials({ email: '', password: '', nome: '' });
                }}
              >
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
          </div>
        </div>

        <div className="auth-benefits">
          <h3>🎁 Benefícios da Competição:</h3>
          <ul>
            <li>💰 100 créditos iniciais ao se cadastrar</li>
            <li>🏆 Ranking de jogadores</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
