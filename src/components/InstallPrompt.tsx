"use client";

import { usePWA } from '@/hooks/usePWA';
import { useCounter } from '@/hooks/useCounter';
import { useState } from 'react';

export default function InstallPrompt() {
  const { isInstallable, isInstalled, installApp, shareApp } = usePWA();
  const { incrementCounter } = useCounter('download-button-clicks');
  const [isVisible, setIsVisible] = useState(true);

  if (isInstalled || !isInstallable || !isVisible) {
    return null;
  }

  const handleDownloadClick = async () => {
    // Incrementar contador antes de instalar
    await incrementCounter();
    installApp();
  };

  return (
    <div className="install-prompt">
      <div className="install-content">
        <div className="install-icon">📱</div>
        <div className="install-text">
          <h3>Instalar Show do Milênio</h3>
          <p>Adicione à tela inicial para acesso rápido!</p>
        </div>
        <div className="install-actions">
          <button 
            className="install-btn"
            onClick={handleDownloadClick}
          >
            Baixar
          </button>
          <button 
            className="share-btn"
            onClick={shareApp}
            title="Compartilhar app"
          >
            📤
          </button>
          <button 
            className="close-btn"
            onClick={() => setIsVisible(false)}
            title="Fechar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
