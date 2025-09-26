"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Partida } from '@/types/auth';

interface CompetitionScreenProps {
  startQuiz: (category: string) => void;
  onBack: () => void;
}

export default function CompetitionScreen({ startQuiz, onBack }: CompetitionScreenProps) {
  const { user, signOut, updateUserCredits } = useAuth();
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar histórico de partidas
  useEffect(() => {
    const fetchPartidas = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('partidas')
          .select('*')
          .eq('usuario_id', user.id)
          .order('criado_em', { ascending: false })
          .limit(10);

        if (error) throw error;
        setPartidas(data || []);
      } catch (error) {
        console.error('Erro ao buscar partidas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartidas();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      onBack();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getPerformanceMessage = () => {
    if (partidas.length === 0) return "Primeira partida! Boa sorte! 🍀";
    
    const recentPartidas = partidas.slice(0, 3);
    const avgAcertos = recentPartidas.reduce((sum, p) => sum + p.acertos, 0) / recentPartidas.length;
    
    if (avgAcertos >= 8) return "Excelente performance! 🔥";
    if (avgAcertos >= 6) return "Boa performance! 👍";
    if (avgAcertos >= 4) return "Continue praticando! 💪";
    return "Você está melhorando! 📈";
  };

  const getTotalCreditsEarned = () => {
    return partidas.reduce((sum, p) => sum + p.creditos_ganhos, 0);
  };

  if (loading) {
    return (
      <div className="competition-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="competition-container">
      {/* Header com informações do usuário */}
      <div className="user-header">
        <div className="user-info">
          <div className="user-avatar">
            {user?.foto_perfil ? (
              <img src={user.foto_perfil} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="user-details">
            <h2>Olá, {user?.nome || user?.email?.split('@')[0]}!</h2>
            <p className="performance-message">{getPerformanceMessage()}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Sair
        </button>
      </div>

      {/* Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card credits">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{user?.creditos || 0}</h3>
            <p>Créditos Atuais</p>
          </div>
        </div>

        <div className="stat-card earned">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>+{getTotalCreditsEarned()}</h3>
            <p>Créditos Ganhos</p>
          </div>
        </div>

        <div className="stat-card games">
          <div className="stat-icon">🎮</div>
          <div className="stat-content">
            <h3>{partidas.length}</h3>
            <p>Partidas Jogadas</p>
          </div>
        </div>

        <div className="stat-card accuracy">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>
              {partidas.length > 0 
                ? Math.round((partidas.reduce((sum, p) => sum + p.acertos, 0) / 
                  (partidas.reduce((sum, p) => sum + p.acertos + p.erros, 0))) * 100) || 0
                : 0}%
            </h3>
            <p>Precisão</p>
          </div>
        </div>
      </div>

      {/* Seleção de Categoria */}
      <div className="category-selection">
        <h3>Escolha uma categoria para competir:</h3>
        <div className="category-grid">
          <div 
            className="category-card competition"
            onClick={() => startQuiz("futebol")}
          >
            <div className="category-icon">⚽</div>
            <h4>Futebol</h4>
            <p>Teste seus conhecimentos sobre o esporte mais popular do mundo</p>
          </div>
          
          <div 
            className="category-card competition"
            onClick={() => startQuiz("novelas")}
          >
            <div className="category-icon">📺</div>
            <h4>Novelas</h4>
            <p>Demonstre que você é um expert em novelas brasileiras</p>
          </div>
        </div>
      </div>

      {/* Histórico de Partidas */}
      {partidas.length > 0 && (
        <div className="partidas-history">
          <h3>Histórico Recente</h3>
          <div className="partidas-list">
            {partidas.slice(0, 5).map((partida) => (
              <div key={partida.id} className="partida-item">
                <div className="partida-date">
                  {new Date(partida.criado_em).toLocaleDateString('pt-BR')}
                </div>
                <div className="partida-stats">
                  <span className="acertos">✅ {partida.acertos}</span>
                  <span className="erros">❌ {partida.erros}</span>
                  <span className={`creditos ${partida.creditos_ganhos >= 0 ? 'positive' : 'negative'}`}>
                    {partida.creditos_ganhos >= 0 ? '+' : ''}{partida.creditos_ganhos}
                  </span>
                </div>
                <div className="partida-final">
                  Saldo: {partida.creditos_final} créditos
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações sobre o sistema de créditos */}
      <div className="credits-info">
        <h3>💡 Como funciona o sistema de créditos?</h3>
        <ul>
          <li>🎁 Você começa com <strong>100 créditos grátis</strong></li>
          <li>🎯 Cada partida custa créditos baseados na dificuldade</li>
          <li>📈 Acertos consecutivos aumentam o multiplicador</li>
          <li>💰 Créditos são ganhos/perdidos baseados na performance</li>
          <li>🏆 Mantenha-se no topo do ranking!</li>
        </ul>
      </div>
    </div>
  );
}
