"use client";
import { useAuth } from '@/hooks/useAuth';

interface OptionsScreenProps {
  setScreen: (screen: any) => void;
}

export default function OptionsScreen({ setScreen }: OptionsScreenProps) {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    setScreen("modalidade");
  };

  const handleBack = () => {
    setScreen("modalidade");
  };

  if (isLoading) {
    return (
      <div className="blue-theme">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blue-theme">
      {/* Logo Show do Milênio */}
      <div className="show-milenio-logo">
        <h1>🎯 SHOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🏆
        </div>
      </div>

      {/* Botão Voltar */}
      <div className="back-button-container">
        <button
          className="btn btn-secondary"
          onClick={handleBack}
        >
          ← Voltar
        </button>
      </div>

      {/* Main Card */}
      <div className="options-card">
        <h2>Opções da Conta</h2>
        
        {user ? (
          <div className="user-details">
            <div className="detail-row">
              <span className="detail-label">Nome:</span>
              <span className="detail-value">{user.name}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Créditos:</span>
              <span className="detail-value">{user.credits.toLocaleString()}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Pontuação Total:</span>
              <span className="detail-value">{user.totalScore.toLocaleString()}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Melhor Pontuação:</span>
              <span className="detail-value">{user.bestScore.toLocaleString()}</span>
            </div>
            
          </div>
        ) : (
          <div className="no-user">
            <p>Sessão não iniciada.</p>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="options-actions">
          <button
            className="btn btn-primary"
            onClick={handleBack}
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    </div>
  );
}
