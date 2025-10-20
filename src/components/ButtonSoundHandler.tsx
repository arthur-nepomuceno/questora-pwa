'use client';

import { useEffect, useRef } from 'react';
import { useSounds } from '@/hooks/useSounds';

export default function ButtonSoundHandler() {
  const { playButtonPress } = useSounds();
  const isQuizScreenRef = useRef(false);

  useEffect(() => {
    // Verificar tela de quiz apenas uma vez
    const checkQuizScreen = () => {
      isQuizScreenRef.current = document.querySelector('.quiz-main-layout') !== null;
    };
    
    checkQuizScreen();
    
    const handleButtonClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Verificação rápida de tela de quiz
      if (isQuizScreenRef.current) {
        return;
      }
      
      // Verificação otimizada de botão
      if (
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.closest('[role="button"]')
      ) {
        playButtonPress();
      }
    };

    // Listener com flag de captura para melhor performance
    document.addEventListener('click', handleButtonClick, { passive: true });

    // Verificar mudança de tela periodicamente
    const interval = setInterval(checkQuizScreen, 1000);

    return () => {
      document.removeEventListener('click', handleButtonClick);
      clearInterval(interval);
    };
  }, []); // Sem dependências para evitar re-criação

  return null;
}
