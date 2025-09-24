"use client";

interface ComingSoonScreenProps {
  modalidade: string;
  goBack: () => void;
}

export default function ComingSoonScreen({ modalidade, goBack }: ComingSoonScreenProps) {
  const handleGoBack = () => {
    goBack();
  };

  const getModalidadeIcon = (modalidade: string) => {
    switch (modalidade) {
      case "competicao":
        return "🏆";
      case "premiacao":
        return "🪙";
      default:
        return "🚧";
    }
  };

  const getModalidadeName = (modalidade: string) => {
    switch (modalidade) {
      case "competicao":
        return "Competição";
      case "premiacao":
        return "Premiação";
      default:
        return "Modalidade";
    }
  };

  return (
    <>
      {/* Logo Show do Milênio no estilo Show do Milhão */}
      <div className="show-milenio-logo">
        <h1>🎯 SHOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🏆
        </div>
      </div>

      {/* Main Card */}
      <div className="welcome-card">
        <div className="coming-soon-icon">
          {getModalidadeIcon(modalidade)}
        </div>
        <h2>Em breve!</h2>
        <p>Modalidade <strong>{getModalidadeName(modalidade)}</strong> em construção.</p>
        
        <div className="coming-soon-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleGoBack}
          >
            Voltar
          </button>
        </div>
      </div>
    </>
  );
}
