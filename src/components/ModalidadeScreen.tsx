"use client";

import { useAuth } from '@/hooks/useAuth';

interface ModalidadeScreenProps {
  selectModalidade: (modalidade: string) => void;
}

export default function ModalidadeScreen({ selectModalidade }: ModalidadeScreenProps) {
  const { user, logout, isLoading } = useAuth();

  const handleModalidadeClick = (modalidade: string) => {
    selectModalidade(modalidade);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="blue-theme">
      {/* Logo Show do Milênio no estilo Show do Milhão */}
      <div className="show-milenio-logo">
        <h1>🎯 SHOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🏆
        </div>
      </div>

      {/* Main Card */}
      <div className="welcome-card">
        <h2>Bem-vindo ao Show do Milênio!</h2>
        <p>Escolha uma modalidade para participar:</p>
        
        {/* Modalidade Selection */}
        <div className="category-selection">
          <div 
            className="category-card"
            onClick={() => handleModalidadeClick("livre")}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">🎯</div>
            <h3>Livre</h3>
          </div>
          
          <div 
            className="category-card"
            onClick={() => handleModalidadeClick("competicao")}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">🏆</div>
            <h3>Competição</h3>
          </div>

          <div 
            className="category-card"
            onClick={() => handleModalidadeClick("premiacao")}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">🪙</div>
            <h3>Premiação</h3>
          </div>
        </div>
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
          >
            Créditos e Pontuação
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

        .logout-btn:disabled {
          background: #666 !important;
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
