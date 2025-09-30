"use client";

import { useAuth } from '@/hooks/useAuth';

interface CreditsScreenProps {
  setScreen: (screen: any) => void;
  startQuizWithCredits: (credits: number) => void;
  goToOptions: () => void;
}

export default function CreditsScreen({ setScreen, startQuizWithCredits, goToOptions }: CreditsScreenProps) {
  const { user, logout, isLoading } = useAuth();

  const creditOptions = [
    { value: 100, icon: "💰", label: "100 Créditos" },
    { value: 500, icon: "💰", label: "500 Créditos" },
    { value: 700, icon: "💎", label: "700 Créditos" },
    { value: 1000, icon: "🏆", label: "1000 Créditos" }
  ];

  const handleCreditSelect = (credits: number) => {
    
    if (user && user.credits < credits) {
      alert(`Créditos insuficientes! Você tem ${user.credits} créditos, mas precisa de ${credits}.`);
      return;
    }
    
    startQuizWithCredits(credits);
  };

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
        <h2>Escolha os créditos da rodada</h2>
        <p>Selecione quanto deseja investir nesta rodada:</p>
        
        {/* Credit Options */}
        <div className="credits-options">
          {creditOptions.map((option) => (
            <div
              key={option.value}
              className="credit-card"
              onClick={() => handleCreditSelect(option.value)}
            >
              <div className="credit-icon">{option.icon}</div>
              <h3>{option.label}</h3>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <button
          className="btn btn-secondary"
          onClick={() => setScreen("start")}
        >
          Voltar
        </button>
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
      `}</style>
    </div>
  );
}
