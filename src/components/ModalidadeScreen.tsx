"use client";

interface ModalidadeScreenProps {
  selectModalidade: (modalidade: string) => void;
}

export default function ModalidadeScreen({ selectModalidade }: ModalidadeScreenProps) {
  const handleModalidadeClick = (modalidade: string) => {
    selectModalidade(modalidade);
  };

  return (
    <div className="blue-theme">
      {/* Logo Show do Milênio no estilo Show do Milhão */}
      <div className="show-milenio-logo">
        <h1>🎯 SHOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🏆
        </div>
      </div>

      {/* Main Card */}
      <div className="welcome-card">
        <h2>Bem-vindo ao Show do Milênio!</h2>
        <p>Escolha uma modalidade para participar:</p>
        
        {/* Modalidade Selection */}
        <div className="category-selection">
          <div 
            className="category-card"
            onClick={() => handleModalidadeClick("livre")}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">🎯</div>
            <h3>Livre</h3>
          </div>
          
          <div 
            className="category-card"
            onClick={() => handleModalidadeClick("competicao")}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">🏆</div>
            <h3>Competição</h3>
          </div>

          <div 
            className="category-card"
            onClick={() => handleModalidadeClick("premiacao")}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">🪙</div>
            <h3>Premiação</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
