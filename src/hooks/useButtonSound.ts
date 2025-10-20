'use client';

import { useEffect } from 'react';
import { useSounds } from './useSounds';

export const useButtonSound = () => {
  const { playButtonPress } = useSounds();

  useEffect(() => {
    const handleButtonClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Verificar se é um botão ou elemento clicável
      if (
        target.tagName === 'BUTTON' ||
        target.getAttribute('role') === 'button' ||
        target.style.cursor === 'pointer' ||
        target.classList.contains('clickable') ||
        target.onclick !== null
      ) {
        playButtonPress();
      }
    };

    // Adicionar listener global
    document.addEventListener('click', handleButtonClick);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  }, [playButtonPress]);
};
