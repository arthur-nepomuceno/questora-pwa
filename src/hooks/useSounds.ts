'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useSoundContext } from '@/contexts/SoundContext';

export const useSounds = () => {
  const { isMuted, endGameAudioRef, playMainTheme, playQuizTheme, stopTheme } = useSoundContext();
  const buttonAudioRef = useRef<HTMLAudioElement | null>(null);

  // Pré-carregar áudios para reduzir latência
  useEffect(() => {
    buttonAudioRef.current = new Audio('/sounds/press-button.mp3');
    buttonAudioRef.current.volume = 0.2;
    buttonAudioRef.current.preload = 'auto';
  }, []);

  // Função para tocar a música do quiz (usa o sistema centralizado)
  const playQuizMusic = () => {
    playQuizTheme();
  };

  // Função para parar a música do quiz
  const stopQuizMusic = () => {
    // Quando sair do quiz, para a música tema
    // A próxima tela que montar vai iniciar sua própria música tema
    stopTheme();
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
    playMainTheme,
  };
};
