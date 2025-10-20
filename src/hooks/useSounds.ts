'use client';

import { useRef, useEffect } from 'react';
import { useSoundContext } from '@/contexts/SoundContext';

export const useSounds = () => {
  const { isMuted } = useSoundContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Atualizar volume quando mute muda
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.3;
    }
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

  // Função para tocar som de resposta correta
  const playCorrectAnswer = () => {
    if (!isMuted) {
      const correctAudio = new Audio('/sounds/right-answer.mp3');
      correctAudio.volume = 0.3;
      correctAudio.play().catch(() => {});
    }
  };

  // Função para tocar som de fim de jogo
  const playEndGame = () => {
    if (!isMuted) {
      const endGameAudio = new Audio('/sounds/end-game.m4a');
      endGameAudio.volume = 0.3;
      endGameAudio.play().catch(() => {});
    }
  };

  return {
    isMuted,
    playQuizMusic,
    stopQuizMusic,
    playCorrectAnswer,
    playEndGame,
  };
};
