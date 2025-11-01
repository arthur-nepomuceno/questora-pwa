'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useSoundContext } from '@/contexts/SoundContext';

export const useSounds = () => {
  const { isMuted, endGameAudioRef } = useSoundContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const buttonAudioRef = useRef<HTMLAudioElement | null>(null);

  // Atualizar volume quando mute muda
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.3;
    }
  }, [isMuted]);

  // Pré-carregar áudios para reduzir latência
  useEffect(() => {
    buttonAudioRef.current = new Audio('/sounds/press-button.mp3');
    buttonAudioRef.current.volume = 0.2;
    buttonAudioRef.current.preload = 'auto';
  }, []);

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
    if (!isMuted && endGameAudioRef.current) {
      endGameAudioRef.current.currentTime = 0; // Reset para início
      endGameAudioRef.current.play().catch(() => {});
    }
  };

  // Função para parar o som de fim de jogo
  const stopEndGame = useCallback(() => {
    if (endGameAudioRef.current) {
      endGameAudioRef.current.pause();
      endGameAudioRef.current.currentTime = 0;
    }
  }, [endGameAudioRef]);

  // Função para tocar som de botão pressionado (otimizada)
  const playButtonPress = () => {
    if (!isMuted && buttonAudioRef.current) {
      // Reset e play em uma operação
      const audio = buttonAudioRef.current;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  return {
    isMuted,
    playQuizMusic,
    stopQuizMusic,
    playCorrectAnswer,
    playEndGame,
    stopEndGame,
    playButtonPress,
  };
};
