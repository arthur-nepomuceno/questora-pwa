'use client';

import { useEffect, useRef, useState } from 'react';

interface RankingScreenProps {
  setScreen: (screen: any) => void;
}

interface RankingParticipant {
  id: string;
  name: string;
  totalPoints: number;
  position: number;
}

export default function RankingScreen({ setScreen }: RankingScreenProps) {
  // Estados
  const [participant, setParticipant] = useState<RankingParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Contador de renders
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  console.log('🔵 [RANKING] Componente renderizado:', renderCount.current, 'vezes');
  console.log('🔵 [RANKING] Estado atual - loading:', loading, '| participant:', participant.length, '| error:', error);
  
  const fetchRankingData = async () => {
    try {
      console.log('⏳ [RANKING] ANTES de setLoading(true)');
      setLoading(true);
      console.log('⏳ [RANKING] DEPOIS de setLoading(true)');
      setError(null);
      console.log('🟡 [RANKING] Iniciando fetch da API...');
      
      // Delay mínimo de 1 segundo ANTES de chamar a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch('/api/ranking');
      
      console.log('🟢 [RANKING] Resposta recebida:', response.status);
      
      const result = await response.json();
      console.log('🟢 [RANKING] Dados parseados:', result);
      
      if (result.data) {
        console.log('✅ [RANKING] Setando participant com', result.data.length, 'jogadores');
        setParticipant(result.data);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {

      console.log('❌ [RANKING] Setando error:', error instanceof Error ? error.message : 'Erro ao buscar ranking');
      setError(error instanceof Error ? error.message : 'Erro ao buscar ranking');
    } finally {
      console.log('⏹️ [RANKING] Setando loading = false');
      setLoading(false);
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
        
        
        {/* Loading */}
        {loading && (
          <div className="ranking-loading">
            <div className="spinner"></div>
            <p>Carregando ranking...</p>
          </div>
        )}
        
        {/* Placeholder para o ranking */}
        {!loading && (
          <div className="ranking-placeholder">
            <p>📊 Ranking será implementado aqui...</p>
          </div>
        )}
      </div>
    </div>
  );
}
