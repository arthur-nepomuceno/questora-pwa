'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  endGameAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  themeAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  playMainTheme: () => void;
  playQuizTheme: () => void;
  stopTheme: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const endGameAudioRef = useRef<HTMLAudioElement | null>(null);
  const themeAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentThemeRef = useRef<string | null>(null);

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
    
    // Atualizar volume da música tema quando mute muda
    if (themeAudioRef.current) {
      themeAudioRef.current.volume = isMuted ? 0 : 0.3;
    }
  }, [isMuted]);

  // Função para tocar música tema principal
  const playMainTheme = () => {
    // Se já está tocando main-theme, não faz nada
    if (currentThemeRef.current === 'main-theme' && themeAudioRef.current && !themeAudioRef.current.paused) {
      return;
    }
    
    // Se está tocando outra música, para ela
    if (themeAudioRef.current && currentThemeRef.current !== 'main-theme') {
      themeAudioRef.current.pause();
      themeAudioRef.current = null;
    }
    
    // Se não existe ou está pausada, cria e toca
    if (!themeAudioRef.current || themeAudioRef.current.paused) {
      themeAudioRef.current = new Audio('/sounds/main-theme.mp3');
      themeAudioRef.current.loop = true;
      themeAudioRef.current.volume = isMuted ? 0 : 0.3;
      themeAudioRef.current.play().catch(console.error);
      currentThemeRef.current = 'main-theme';
    }
  };

  // Função para tocar música tema do quiz
  const playQuizTheme = () => {
    // Se já está tocando quiz-theme, não faz nada
    if (currentThemeRef.current === 'quiz-theme' && themeAudioRef.current && !themeAudioRef.current.paused) {
      return;
    }
    
    // Se está tocando outra música, para ela
    if (themeAudioRef.current && currentThemeRef.current !== 'quiz-theme') {
      themeAudioRef.current.pause();
      themeAudioRef.current = null;
    }
    
    // Se não existe ou está pausada, cria e toca
    if (!themeAudioRef.current || themeAudioRef.current.paused) {
      themeAudioRef.current = new Audio('/sounds/quiz-theme.mp3');
      themeAudioRef.current.loop = true;
      themeAudioRef.current.volume = isMuted ? 0 : 0.3;
      themeAudioRef.current.play().catch(console.error);
      currentThemeRef.current = 'quiz-theme';
    }
  };

  // Função para parar música tema
  const stopTheme = () => {
    if (themeAudioRef.current) {
      themeAudioRef.current.pause();
      themeAudioRef.current = null;
      currentThemeRef.current = null;
    }
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (themeAudioRef.current) {
        themeAudioRef.current.pause();
        themeAudioRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <SoundContext.Provider value={{ 
      isMuted, 
      toggleMute, 
      endGameAudioRef,
      themeAudioRef,
      playMainTheme,
      playQuizTheme,
      stopTheme
    }}>
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
