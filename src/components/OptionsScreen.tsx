"use client";
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSounds } from '@/hooks/useSounds';
import PurchaseCreditsScreen from './PurchaseCreditsScreen';

interface OptionsScreenProps {
  setScreen: (screen: any) => void;
}

export default function OptionsScreen({ setScreen }: OptionsScreenProps) {
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
          <button
            className="btn btn-primary"
            onClick={() => {
              playButtonPress();
              setShowPurchaseModal(true);
            }}
          >
            Inserir Créditos
          </button>
        </div>
      </div>

      {/* Purchase Credits Modal */}
      {showPurchaseModal && (
        <>
          <div 
            className="modal-overlay"
            onClick={() => setShowPurchaseModal(false)}
          />
          <div className="modal-content">
            <button 
              className="close-modal-btn"
              onClick={() => setShowPurchaseModal(false)}
              title="Fechar"
            >
              ✕
            </button>
            <PurchaseCreditsScreen 
              setScreen={(screen) => {
                setShowPurchaseModal(false);
                setScreen(screen);
              }} 
              goToOptions={() => {}}
              hideUserInfo={true}
              onClose={() => setShowPurchaseModal(false)}
            />
          </div>
        </>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10000;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          animation: fadeIn 0.3s ease-in;
        }

        .close-modal-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          transition: all 0.3s;
          line-height: 1;
        }

        .close-modal-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .modal-content :global(.blue-theme) {
          margin: 0;
        }

        .modal-content :global(.show-milenio-logo) {
          font-size: 1.5rem;
          padding: 15px;
          margin-bottom: 10px;
        }

        .modal-content :global(.credits-card) {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
