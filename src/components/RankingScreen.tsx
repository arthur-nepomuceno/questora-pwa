'use client';

interface RankingScreenProps {
  setScreen: (screen: any) => void;
}

export default function RankingScreen({ setScreen }: RankingScreenProps) {
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
