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
  const [currentTime, setCurrentTime] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [nextUpdate, setNextUpdate] = useState<string>('');

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
        
        // Formatar horário da próxima atualização
        if (result.nextUpdate) {
          setNextUpdate(new Date(result.nextUpdate).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }));
        }
        
        // Formatar horário da última atualização
        if (result.lastUpdate) {
          setLastUpdate(new Date(result.lastUpdate).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }));
        }

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
  
  // Função para atualizar o relógio
  const updateClock = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));
  };

  useEffect(() => {
    console.log('🟣 [RANKING] useEffect executado');
    fetchRankingData();
    
    // Inicializar relógio
    // updateClock();
    
    // Atualizar relógio a cada segundo
    // const clockInterval = setInterval(updateClock, 1000);
    
    // Cleanup
    // return () => clearInterval(clockInterval);
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

      {/* Botão Voltar e Relógio */}
      <div className="ranking-controls">
        <div className="back-button-container">
          <button
            className="btn btn-secondary"
            onClick={handleBack}
          >
            ← Voltar
          </button>
        </div>
        
        {/* <div className="ranking-clock-side">
          <div className="clock-time">{currentTime}</div>
        </div> */}
      </div>

      {/* Main Card */}
      <div className="ranking-card">

        {/* Ranking Header */}
        <h2>🏆 Ranking dos Participantes</h2>

        {/* Ranking Description */}
        {!loading && (
          <div>
            <p>
              Exibindo os TOP 50 participantes! Continue acumulando pontos para subir de posição! 
            </p>
            <p>
              Última atualização: {lastUpdate}.
            </p>
            <p>
              Próxima atualização do Ranking: {nextUpdate}.<br />
              (Clique em &quot;Voltar&quot; e &quot;Ver Ranking&quot; para visualizar.)
            </p>
          </div>
        )}     
        
        
        {/* Loading */}
        {loading && (
          <div className="ranking-loading">
            <div className="spinner"></div>
            <p>Carregando ranking...</p>
          </div>
        )}
        
        {/* Ranking List */}
        {!loading && (
          <div className="ranking-list">
            {participant.map((player, index) => (
              <div key={player.id} className="ranking-item">
                <div className={`ranking-position ${index >= 3 && index <= 9 ? 'number' : ''}`}>
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `${index + 1}º`}
                </div>
                <div className="ranking-info">
                  <div className="ranking-name">{player.name}</div>
                  <div className="ranking-points">{player.totalPoints} pontos</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
