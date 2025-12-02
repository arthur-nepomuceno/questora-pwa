"use client";

import { Screen } from '@/types/quiz';
import { useAuth } from '@/hooks/useAuth';
import { useSounds } from '@/hooks/useSounds';
import { useEffect } from 'react';

interface CategoryScreenProps {
  startQuiz: (category: string) => void;
  setScreen: (screen: Screen) => void;
  goBackToModalidade?: () => void;
  goToOptions: () => void;
  selectedModalidade?: string | null;
}

export default function CategoryScreen({ startQuiz, setScreen, goBackToModalidade, goToOptions, selectedModalidade }: CategoryScreenProps) {
  const { user, logout, isLoading } = useAuth();
  const { playButtonPress, playMainTheme } = useSounds();

  // Tocar música tema quando a tela monta
  useEffect(() => {
    playMainTheme();
  }, [playMainTheme]);

  const handleLogout = async () => {
    await logout();
    if (goBackToModalidade) {
      goBackToModalidade();
    } else {
      setScreen("modalidade");
    }
  };

  return (
    <div className="blue-theme">
      {/* Logo Show do Milênio no estilo Show do Milhão */}
      <div className="show-milenio-logo">
	    <h1>🎯 <span style={{ fontSize: '1.25em', lineHeight: 1, display: 'inline-block' }}>S</span>HOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🏆
        </div>
      </div>

      {/* Main Card */}
      <div className="welcome-card">
        <h2>Bem-vindo!</h2>
        <p>Escolha uma categoria para começar:</p>
        
        {/* Category Selection */}
        <div className="category-selection">
          <div 
            className="category-card"
            onClick={() => {
              playButtonPress();
              startQuiz("futebol");
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">⚽</div>
            <h3>Futebol</h3>
          </div>
          
          <div 
            className="category-card"
            onClick={() => {
              playButtonPress();
              startQuiz("novelas");
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">📺</div>
            <h3>Novelas</h3>
          </div>
        </div>

        {/* Back Button - Apenas para modalidade Livre */}
        {selectedModalidade === 'livre' && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              playButtonPress();
              goBackToModalidade ? goBackToModalidade() : setScreen("modalidade");
            }}
            style={{ marginTop: '20px' }}
          >
            Voltar
          </button>
        )}
      </div>

      {/* User Info */}
      {user && !isLoading ? (
        <div className="user-info">
          <div className="user-email">
            <span className="user-icon">👤</span>
            <span>{user.email.split('@')[0]}</span>
          </div>
          <button
            className="credits-btn"
            title="Ver créditos e pontuação"
            onClick={goToOptions}
          >
            Dados da Conta
          </button>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Sair da conta"
          >
            🚪 Sair
          </button>
        </div>
      ) : (
        <div className="user-info">
          <div className="user-email">
            <span className="user-icon">👤</span>
            <span>Sessão não iniciada.</span>
          </div>
          {selectedModalidade === 'livre' && (
            <button
              className="login-btn"
              onClick={() => setScreen("auth")}
              title="Iniciar sessão para modalidade Premiação"
            >
              Iniciar sessão
            </button>
          )}
        </div>
      )}
      
      {/* Loading placeholder */}
      {isLoading && (
        <div className="user-info loading">
          <div className="user-email">
            <span className="user-icon">👤</span>
            <span>Carregando...</span>
          </div>
          <div className="logout-btn loading-btn">
            🚪 Sair
          </div>
        </div>
      )}

      <style jsx>{`
        .user-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 15px 20px;
          border-radius: 12px;
          margin: 20px auto;
          max-width: 500px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .user-email {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-weight: 500;
        }

        .user-icon {
          font-size: 1.2rem;
        }

        .logout-btn {
          background: #1976d2;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
          font-size: 0.9rem;
        }

        .logout-btn:hover {
          background: #1565c0;
        }

        .user-info.loading {
          opacity: 0.7;
        }

        .loading-btn {
          background: #666 !important;
          cursor: not-allowed;
        }

        .loading-btn:hover {
          background: #666 !important;
        }

        .login-btn {
          background: #1976d2;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
          font-size: 0.9rem;
        }

        .login-btn:hover {
          background: #1565c0;
        }
      `}</style>
    </div>
  );
}
