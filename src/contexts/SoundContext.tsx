'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  endGameAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const endGameAudioRef = useRef<HTMLAudioElement | null>(null);

  // Carregar preferência do localStorage
  useEffect(() => {
    const savedMute = localStorage.getItem('app-sounds-muted');
    if (savedMute !== null) {
      setIsMuted(JSON.parse(savedMute));
    }
  }, []);

  // Salvar preferência no localStorage
  useEffect(() => {
    localStorage.setItem('app-sounds-muted', JSON.stringify(isMuted));
  }, [isMuted]);

  // Inicializar o áudio de fim de jogo
  useEffect(() => {
    endGameAudioRef.current = new Audio('/sounds/end-game.mp3');
    endGameAudioRef.current.volume = 0.3;
    endGameAudioRef.current.preload = 'auto';

    return () => {
      if (endGameAudioRef.current) {
        endGameAudioRef.current.pause();
        endGameAudioRef.current = null;
      }
    };
  }, []);

  // Parar o som de fim de jogo quando o mute é ativado
  useEffect(() => {
    if (isMuted && endGameAudioRef.current) {
      endGameAudioRef.current.pause();
      endGameAudioRef.current.currentTime = 0;
    } else if (!isMuted && endGameAudioRef.current) {
      endGameAudioRef.current.volume = 0.3;
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, endGameAudioRef }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSoundContext must be used within a SoundProvider');
  }
  return context;
}
