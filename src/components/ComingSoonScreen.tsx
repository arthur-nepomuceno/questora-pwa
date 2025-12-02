"use client";

import { useEffect } from 'react';
import { useSounds } from '@/hooks/useSounds';

interface ComingSoonScreenProps {
  modalidade: string;
  goBack: () => void;
}

export default function ComingSoonScreen({ modalidade, goBack }: ComingSoonScreenProps) {
  const { playMainTheme } = useSounds();

  // Tocar música tema quando a tela monta
  useEffect(() => {
    playMainTheme();
  }, [playMainTheme]);
  const handleGoBack = () => {
    goBack();
  };

  const getModalidadeIcon = (modalidade: string) => {
    switch (modalidade) {
      case "competicao":
        return "🏆";
      // case "premiacao": // Comentado temporariamente
      //   return "🪙";
      default:
        return "🚧";
    }
  };

  const getModalidadeName = (modalidade: string) => {
    switch (modalidade) {
      case "competicao":
        return "Competição";
      // case "premiacao": // Comentado temporariamente
      //   return "Premiação";
      default:
        return "Modalidade";
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
        <div className="coming-soon-icon">
          {getModalidadeIcon(modalidade)}
        </div>
        <h2>Em breve!</h2>
        <p>Modalidade <strong>{getModalidadeName(modalidade)}</strong> em construção.</p>
        
        <div className="coming-soon-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleGoBack}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
