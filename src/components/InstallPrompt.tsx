"use client";

import { usePWA } from '@/hooks/usePWA';
import { useCounter } from '@/hooks/useCounter';
import { useState } from 'react';

export default function InstallPrompt() {
  const { isInstallable, isInstalled, installApp, shareApp } = usePWA();
  const { incrementCounter, incrementLocalOnly } = useCounter('download-button-clicks');
  const { incrementCounter: incrementInstallAcceptedCounter, incrementLocalOnly: incrementInstallAcceptedLocalOnly } = useCounter('instalacoes-aceitas');
  const [isVisible, setIsVisible] = useState(true);

  if (isInstalled || !isInstallable || !isVisible) {
    return null;
  }

  const handleDownloadClick = async () => {
    try {
      // 1. Salvar localStorage IMEDIATAMENTE (síncrono)
      incrementLocalOnly();
      
      // 2. Pequeno delay para garantir persistência
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 3. Firestore em background (não bloqueia navegação)
      // skipLocalStorage: true porque já foi incrementado acima
      // IMPORTANTE: Salvar ANTES de abrir o dialog, para não depender da escolha do usuário
      incrementCounter(undefined, { skipLocalStorage: true }).catch(err => console.error('Erro ao salvar no Firestore:', err));
      
      // 4. Instalar app e aguardar escolha do usuário
      const choiceResult = await installApp();
      
      // 5. Se o usuário aceitou a instalação, incrementar contador
      if (choiceResult?.outcome === 'accepted') {
        // 1. Salvar localStorage IMEDIATAMENTE (síncrono)
        incrementInstallAcceptedLocalOnly();
        
        // 2. Pequeno delay para garantir persistência
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 3. Firestore em background (não bloqueia navegação)
        // skipLocalStorage: true porque já foi incrementado acima
        incrementInstallAcceptedCounter(undefined, { skipLocalStorage: true })
          .catch(err => console.error('❌ [InstallPrompt] Erro ao salvar instalação aceita no Firestore:', err));
      }
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
