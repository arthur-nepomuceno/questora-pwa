"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSounds } from '@/hooks/useSounds';
import { useDailyCredits } from '@/hooks/useDailyCredits';
import PurchaseCreditModal from './PurchaseCreditModal';

interface CreditsScreenProps {
  setScreen: (screen: any) => void;
  startQuizWithCredits: (credits: number) => void;
  goToOptions: () => void;
  selectedModalidade?: string | null;
}

export default function CreditsScreen({ setScreen, startQuizWithCredits, goToOptions, selectedModalidade }: CreditsScreenProps) {
  const { user, logout, isLoading } = useAuth();
  const { playButtonPress } = useSounds();
  const { dailyCreditsSpent, spendCredits, canSpendCredits, dailyLimit } = useDailyCredits(selectedModalidade);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const creditOptions = [
    { value: 100, icon: "💰", label: "100 Créditos" },
    { value: 500, icon: "💰", label: "500 Créditos" },
    { value: 700, icon: "💎", label: "700 Créditos" },
    { value: 1000, icon: "🏆", label: "1000 Créditos" }
  ];

  const handleCreditSelect = (credits: number) => {
    playButtonPress(); // Tocar som ao escolher créditos
    
    if (user && user.totalCredits < credits) {
      alert(`Créditos insuficientes! Você tem ${user.totalCredits} créditos, mas precisa de ${credits}.`);
      return;
    }
    
    // Verificar limite diário (só para modalidade competição)
    if (selectedModalidade === 'competicao' && !canSpendCredits(credits)) {
      alert(`Controle de vícios: só é permitido utilizar no máximo ${dailyLimit} créditos por dia.`);
      return;
    }
    
    // Gastar créditos diários
    spendCredits(credits);
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
	    <h1>🎯 <span style={{ fontSize: '1.25em', lineHeight: 1, display: 'inline-block' }}>S</span>HOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🏆
        </div>
      </div>

      {/* Main Card */}
      <div className="credits-card">
        <h2>Escolha os créditos da rodada</h2>
        <p>Selecione um pacote de créditos:</p>
        
        {/* Daily Credits Info - Só para modalidade Competição */}
        {selectedModalidade === 'competicao' && (
          <div className="daily-credits-info">
            <span>💰 Créditos gastos hoje: {dailyCreditsSpent}</span>
            <span className="remaining-credits">
              Limite diário de gastos: {dailyLimit}
            </span>
          </div>
        )}
        
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

        {/* Action Buttons */}
        <div className="action-buttons">
          {selectedModalidade !== 'livre' && (
            <button
              className="btn btn-primary"
              onClick={() => {
                playButtonPress();
                setShowPurchaseModal(true);
              }}
            >
              Inserir Créditos
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => setScreen("start")}
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

      {/* Purchase Credits Modal */}
      {showPurchaseModal && (
        <PurchaseCreditModal
          onConfirm={() => {
            playButtonPress();
            setShowPurchaseModal(false);
            window.open('https://t.me/showdomileniooficial_bot?start=', '_blank');
          }}
          onCancel={() => setShowPurchaseModal(false)}
        />
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

        .daily-credits-info {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          text-align: center;
          color: white;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .remaining-credits {
          font-size: 0.9rem;
          color: #4CAF50;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
