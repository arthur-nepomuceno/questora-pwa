"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSounds } from '@/hooks/useSounds';

interface PremiosScreenProps {
  setScreen: (screen: any) => void;
  selectedModalidade?: string | null;
}

export default function PremiosScreen({ setScreen, selectedModalidade }: PremiosScreenProps) {
  const { user, isLoading } = useAuth();
  const { playButtonPress, playMainTheme } = useSounds();

  // Tocar música tema quando a tela monta
  useEffect(() => {
    playMainTheme();
  }, [playMainTheme]);

  const handleBack = () => {
    setScreen("options");
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
        <h2>Prêmios</h2>
        
        <div className="user-details">
          <div className="detail-row">
            <span className="detail-label">Liquidificador:</span>
            <span className="detail-value">300</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Geladeira:</span>
            <span className="detail-value">1500</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Máquina de Lavar:</span>
            <span className="detail-value">2000</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Fogão:</span>
            <span className="detail-value">700</span>
          </div>           
          
        </div>
      </div>
    </div>
  );
}

