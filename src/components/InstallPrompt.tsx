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
    try {
      // Incrementar contador ANTES de instalar
      // Usar await para garantir que o Firestore seja atualizado
      await incrementCounter();
      
      // Verificar se o localStorage foi salvo corretamente
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const key = 'download-button-clicks-count';
        const saved = localStorage.getItem(key);
        console.log(`🔍 [InstallPrompt] Verificando localStorage após incremento: ${saved}`);
        
        // Pequeno delay para garantir que o localStorage seja persistido
        // Em produção, alguns navegadores podem precisar de um momento para sincronizar
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Verificar novamente após o delay
        const savedAfterDelay = localStorage.getItem(key);
        console.log(`🔍 [InstallPrompt] Verificando localStorage após delay: ${savedAfterDelay}`);
      }
      
      // Agora chamar installApp
      installApp();
    } catch (error) {
      console.error('❌ [InstallPrompt] Erro ao processar clique no botão Baixar:', error);
      // Mesmo com erro, tentar instalar o app
      installApp();
    }
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
