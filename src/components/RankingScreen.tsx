'use client';

import { useEffect, useRef } from 'react';

interface RankingScreenProps {
  setScreen: (screen: any) => void;
}

export default function RankingScreen({ setScreen }: RankingScreenProps) {
  // Contador de renders
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  console.log('🔵 [RANKING] Componente renderizado:', renderCount.current, 'vezes');
  
  const fetchRankingData = async () => {
    try {
      console.log('🟡 [RANKING] Iniciando fetch da API...');
      
      const response = await fetch('/api/ranking');
      console.log('🟢 [RANKING] Resposta recebida:', response.status);
      
      const result = await response.json();
      console.log('🟢 [RANKING] Dados parseados:', result);
      
      return result;
    } catch (error) {
      console.error('🔴 [RANKING] Erro ao buscar ranking:', error);
      return null;
    }
  };
  
  useEffect(() => {
    console.log('🟣 [RANKING] useEffect executado');
    fetchRankingData();
  }, []);
  
  const handleBack = () => {
    setScreen("options");
  };

  

  return (
    <div className="blue-theme">
      {/* Logo Show do Milênio */}
      <div className="show-milenio-logo">
        <h1>🎯 SHOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🏆
        </div>
      </div>

      {/* Botão Voltar */}
      <div className="back-button-container">
        <button
          className="btn btn-secondary"
          onClick={handleBack}
        >
          ← Voltar
        </button>
      </div>

      {/* Main Card */}
      <div className="ranking-card">
        <h2>🏆 Ranking dos Jogadores</h2>
        <p>Veja como você se compara com outros jogadores!</p>
        
        {/* Placeholder para o ranking */}
        <div className="ranking-placeholder">
          <p>📊 Ranking será implementado aqui...</p>
        </div>
      </div>
    </div>
  );
}
