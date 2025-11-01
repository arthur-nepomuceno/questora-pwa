"use client";
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSounds } from '@/hooks/useSounds';
import PurchaseCreditModal from './PurchaseCreditModal';

interface OptionsScreenProps {
  setScreen: (screen: any) => void;
  selectedModalidade?: string | null;
}

export default function OptionsScreen({ setScreen, selectedModalidade }: OptionsScreenProps) {
  const { user, logout, isLoading } = useAuth();
  const { playButtonPress } = useSounds();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    setScreen("modalidade");
  };

  const handleBack = () => {
    setScreen("start");
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
	    <h1>🎯 <span style={{ fontSize: '1.25em', lineHeight: 1, display: 'inline-block' }}>S</span>HOW DO MILÊNIO</h1>
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
        <h2>Dados da Conta</h2>
        
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
            
            {/*<div className="detail-row">
              <span className="detail-label">Moedas:</span>
              <span className="detail-value">{user.moedas.toLocaleString()}</span>
            </div>*/}

            <div className="detail-row">
              <span className="detail-label">Pontos:</span>
              <span className="detail-value">{user.totalPoints.toLocaleString()}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Créditos:</span>
              <span className="detail-value">{user.totalCredits.toLocaleString()}</span>
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
            onClick={() => setScreen("ranking")}
          >
            Ver Ranking
          </button>
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
        </div>
      </div>

      {/* Purchase Credits Modal */}
      {showPurchaseModal && (
        <PurchaseCreditModal
          onConfirm={() => {
            playButtonPress();
            setShowPurchaseModal(false);
            setScreen("purchase-credits");
          }}
          onCancel={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
  );
}
