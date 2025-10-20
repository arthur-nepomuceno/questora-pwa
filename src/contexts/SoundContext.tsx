'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);

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

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute }}>
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
