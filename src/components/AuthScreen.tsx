'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginCredentials, SignupCredentials } from '@/types/auth';
import EmailVerificationScreen from './EmailVerificationScreen';

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onBack?: () => void;
}

export default function AuthScreen({ onAuthSuccess, onBack }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState<LoginCredentials>({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState<SignupCredentials>({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [pendingUserName, setPendingUserName] = useState<string>('');
  
  const { login, signup, sendVerificationEmail, isLoading } = useAuth();

  // Função para validar se contém apenas letras (e espaços)
  const isOnlyLetters = (str: string): boolean => {
    return /^[A-Za-zÀ-ÿ\s]+$/.test(str);
  };

  // Handler para validar entrada de nome e sobrenome
  const handleNameChange = (value: string, field: 'firstName' | 'lastName') => {
    // Permite vazio (para poder apagar) ou apenas letras
    if (value === '' || isOnlyLetters(value)) {
      setSignupForm(prev => ({ ...prev, [field]: value }));
    }
  };

  // Função para formatar celular brasileiro (XX) XXXXX-XXXX
  const formatPhone = (value: string): string => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
  };

  // Handler para validar e formatar entrada de celular
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setSignupForm(prev => ({ ...prev, phone: formatted }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await login(loginForm);
    if (result.success) {
      onAuthSuccess();
    } else {
      setError(result.error || 'Erro ao fazer login');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validar se as senhas coincidem
    if (signupForm.password !== confirmPassword) {
      setError('As senhas não coincidem. Por favor, verifique e tente novamente.');
      return;
    }
    
    // Validar celular (deve ter 10 ou 11 dígitos)
    const phoneDigits = signupForm.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setError('Por favor, insira um número de celular válido com DDD.');
      return;
    }
    
    const result = await signup(signupForm);
    if (result.success) {
      // Mostrar tela de verificação de email em vez de ir direto para o app
      const fullName = `${signupForm.firstName} ${signupForm.lastName}`.trim();
      setPendingEmail(signupForm.email);
      setPendingUserName(fullName);
      setShowEmailVerification(true);
      
      // Enviar email de verificação em background
      sendVerificationEmail(signupForm.email, fullName);
    } else {
      setError(result.error || 'Erro ao criar conta');
    }
  };

  const handleBackFromVerification = () => {
    setShowEmailVerification(false);
    setPendingEmail('');
    setPendingUserName('');
    setError('');
    setIsLogin(true); // Direcionar para a tela de login
  };

  const handleEmailVerified = () => {
    setShowEmailVerification(false);
    setPendingEmail('');
    setPendingUserName('');
    onAuthSuccess();
  };

  // Se estiver mostrando a tela de verificação de email
  if (showEmailVerification) {
    return (
      <EmailVerificationScreen
        userEmail={pendingEmail}
        userName={pendingUserName}
        onVerified={handleEmailVerified}
        onBack={handleBackFromVerification}
      />
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Show do Milênio</h1>
          <p>Entre na competição e teste seus conhecimentos!</p>
        </div>

        <div className="auth-methods">
          <div className="auth-tabs">
            <button 
              className={isLogin ? 'active' : ''} 
              onClick={() => {
                setIsLogin(true);
                setError('');
                setConfirmPassword('');
              }}
            >
              Entrar
            </button>
            <button 
              className={!isLogin ? 'active' : ''} 
              onClick={() => {
                setIsLogin(false);
                setError('');
                setConfirmPassword('');
              }}
            >
              Cadastrar
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
              {error.includes('confirme seu email') && (
                <div className="spam-instructions">
                  <p><strong>💡 Dica:</strong> Verifique também sua caixa de <strong>spam/lixo eletrônico</strong>!</p>
                  <p>O email de verificação pode ter ido para lá. Procure por &quot;Firebase&quot; ou &quot;Show do Milênio&quot;.</p>
                </div>
              )}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="login-password">Senha</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Sua senha"
                  required
                />
              </div>
              
              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
              
              {onBack && (
                <button 
                  type="button" 
                  className="back-btn"
                  onClick={onBack}
                >
                  ← Voltar
                </button>
              )}
            </form>
          ) : (
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label htmlFor="signup-firstname">Nome</label>
                <input
                  id="signup-firstname"
                  type="text"
                  value={signupForm.firstName}
                  onChange={(e) => handleNameChange(e.target.value, 'firstName')}
                  placeholder="Seu nome"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="signup-lastname">Sobrenome</label>
                <input
                  id="signup-lastname"
                  type="text"
                  value={signupForm.lastName}
                  onChange={(e) => handleNameChange(e.target.value, 'lastName')}
                  placeholder="Seu sobrenome"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="signup-phone">Celular</label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={signupForm.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="signup-password">Senha</label>
                <input
                  id="signup-password"
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="signup-confirm-password">Confirmar Senha</label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  required
                  minLength={6}
                />
              </div>
              
              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </button>
              
              {onBack && (
                <button 
                  type="button" 
                  className="back-btn"
                  onClick={onBack}
                >
                  ← Voltar
                </button>
              )}
            </form>
          )}
        </div>

        <div className="auth-benefits">
          <h3>🎯 Modalidade Competição</h3>
          <ul>
            <li>✅ Sistema de créditos</li>
            <li>✅ Ranking de jogadores</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .spam-instructions {
          background: #e3f2fd;
          border: 1px solid #2196f3;
          border-radius: 8px;
          padding: 15px;
          margin-top: 15px;
          text-align: left;
        }

        .spam-instructions p {
          margin: 5px 0;
          color: #1565c0;
          font-size: 0.9rem;
        }

        .spam-instructions strong {
          color: #0d47a1;
        }

        .back-btn {
          background: #1976d2;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
          margin-top: 15px;
          width: 100%;
        }

        .back-btn:hover {
          background: #1565c0;
        }
      `}</style>
    </div>
  );
}
