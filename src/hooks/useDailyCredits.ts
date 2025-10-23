'use client';

import { useState, useEffect, useCallback } from 'react';

export const useDailyCredits = (modalidade?: string | null) => {
  const [dailyCreditsSpent, setDailyCreditsSpent] = useState(0);
  
  // Só aplicar controle diário para modalidade "competicao"
  const isCompetitionMode = modalidade === 'competicao';
  const DAILY_LIMIT = 3000; // Limite diário de créditos

  // Verificar e resetar créditos diários (só para competição)
  useEffect(() => {
    if (!isCompetitionMode) {
      setDailyCreditsSpent(0);
      return;
    }

    const today = new Date().toDateString();
    const stored = localStorage.getItem('dailyCredits');
    
    if (stored) {
      const { date, credits } = JSON.parse(stored);
      if (date === today) {
        setDailyCreditsSpent(credits);
      } else {
        // Novo dia - resetar
        setDailyCreditsSpent(0);
        localStorage.setItem('dailyCredits', JSON.stringify({
          date: today,
          credits: 0
        }));
      }
    } else {
      // Primeira vez - inicializar
      setDailyCreditsSpent(0);
      localStorage.setItem('dailyCredits', JSON.stringify({
        date: today,
        credits: 0
      }));
    }
  }, [isCompetitionMode]);

  // Função para verificar se pode gastar créditos
  const canSpendCredits = useCallback((amount: number) => {
    if (!isCompetitionMode) return true; // Sem limite para outras modalidades
    
    return (dailyCreditsSpent + amount) <= DAILY_LIMIT;
  }, [dailyCreditsSpent, isCompetitionMode, DAILY_LIMIT]);

  // Função para gastar créditos (só para competição)
  const spendCredits = useCallback((amount: number) => {
    if (!isCompetitionMode) {
      return; // Não gasta créditos diários em outras modalidades
    }

    const newSpent = dailyCreditsSpent + amount;
    setDailyCreditsSpent(newSpent);
    
    localStorage.setItem('dailyCredits', JSON.stringify({
      date: new Date().toDateString(),
      credits: newSpent
    }));
  }, [dailyCreditsSpent, isCompetitionMode]);

  // Função para resetar manualmente (opcional)
  const resetDailyCredits = useCallback(() => {
    if (!isCompetitionMode) return;
    
    setDailyCreditsSpent(0);
    localStorage.setItem('dailyCredits', JSON.stringify({
      date: new Date().toDateString(),
      credits: 0
    }));
  }, [isCompetitionMode]);

  return {
    dailyCreditsSpent,
    spendCredits,
    canSpendCredits,
    resetDailyCredits,
    dailyLimit: DAILY_LIMIT
  };
};
