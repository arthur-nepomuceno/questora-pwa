'use client';

import { useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RankingScreenProps {
  setScreen: (screen: any) => void;
}

export default function RankingScreen({ setScreen }: RankingScreenProps) {
  
  const fetchRankingData = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('totalPoints', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const rankingData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        totalPoints: doc.data().totalPoints
      }));
      
      console.log('Dados do ranking:', rankingData);
      return rankingData;
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      return [];
    }
  };
  
  useEffect(() => {
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
