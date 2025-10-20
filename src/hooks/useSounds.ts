'use client';

import { useState, useEffect, useRef } from 'react';

export const useSounds = () => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carregar preferência do localStorage
  useEffect(() => {
    const savedMute = localStorage.getItem('sounds-muted');
    if (savedMute !== null) {
      setIsMuted(JSON.parse(savedMute));
    }
  }, []);

  // Salvar preferência no localStorage
  useEffect(() => {
    localStorage.setItem('sounds-muted', JSON.stringify(isMuted));
  }, [isMuted]);

  // Função para tocar a música do quiz
  const playQuizMusic = () => {
    console.log('playQuizMusic chamado');
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    audioRef.current = new Audio('/sounds/quiz-theme.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = isMuted ? 0 : 0.3;
    audioRef.current.play().catch(console.error);
  };

  // Função para parar a música
  const stopQuizMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  // Função para alternar mute
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : 0.3;
    }
  };

  return {
    isMuted,
    playQuizMusic,
    stopQuizMusic,
    toggleMute,
  };
};
