"use client";

import { useAuth } from '@/hooks/useAuth';
import { useSounds } from '@/hooks/useSounds';

interface PurchaseCreditsScreenProps {
  setScreen: (screen: any) => void;
  goToOptions: () => void;
}

export default function PurchaseCreditsScreen({ setScreen, goToOptions }: PurchaseCreditsScreenProps) {
  const { user, logout, isLoading } = useAuth();
  const { playButtonPress } = useSounds();

  const handleLogout = async () => {
    await logout();
    setScreen("modalidade");
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
      <div className="credits-card">
        <h2>Inserir créditos</h2>
        <p>Escolha um pacote de créditos para adicionar à sua conta:</p>
        
        {/* Credit Packages */}
        <div className="credits-options">
          <div className="credit-card">
            <div className="credit-icon">💰</div>
            <h3>300 Créditos</h3>
            <p className="price">R$ 2,99</p>
          </div>
          <div className="credit-card">
            <div className="credit-icon">💰</div>
            <h3>500 Créditos</h3>
            <p className="price">R$ 4,99</p>
          </div>
          <div className="credit-card">
            <div className="credit-icon">💰</div>
            <h3>700 Créditos</h3>
            <p className="price">R$ 6,99</p>
          </div>
          <div className="credit-card">
            <div className="credit-icon">💎</div>
            <h3>1000 Créditos</h3>
            <p className="price">R$ 9,99</p>
          </div>
          <div className="credit-card">
            <div className="credit-icon">💎</div>
            <h3>2000 Créditos</h3>
            <p className="price">R$ 19,99</p>
          </div>
          <div className="credit-card">
            <div className="credit-icon">💎</div>
            <h3>3000 Créditos</h3>
            <p className="price">R$ 29,99</p>
          </div>
          <div className="credit-card">
            <div className="credit-icon">🏆</div>
            <h3>5000 Créditos</h3>
            <p className="price">R$ 49,99</p>
          </div>
          <div className="credit-card">
            <div className="credit-icon">🏆</div>
            <h3>10000 Créditos</h3>
            <p className="price">R$ 99,99</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => setScreen("credits")}
          >
            Voltar
          </button>
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
      ) : !isLoading ? (
        <div className="user-info">
          <div className="user-email">
            <span className="user-icon">👤</span>
            <span>Sessão não iniciada.</span>
          </div>
          <button
            className="login-btn"
            onClick={() => setScreen("auth")}
            title="Voltar para escolha de modalidade"
          >
            Iniciar sessão
          </button>
        </div>
      ) : null}
      
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

        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }

        .price {
          color: #ffffff;
          font-weight: bold;
          font-size: 1.1rem;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
