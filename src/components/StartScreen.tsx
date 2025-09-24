"use client";

interface StartScreenProps {
  startQuiz: (category: string) => void;
}

export default function StartScreen({ startQuiz }: StartScreenProps) {

  return (
    <>
      {/* Logo Show do Milênio no estilo Show do Milhão */}
      <div className="show-milenio-logo">
        <h1>🎯 SHOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🎮
        </div>
      </div>

      {/* Main Card */}
      <div className="welcome-card">
        <h2>Bem-vindo ao Show do Milênio!</h2>
        <p>Escolha uma categoria para começar:</p>
        
        {/* Category Selection */}
        <div className="category-selection">
          <div 
            className="category-card"
            onClick={() => startQuiz("futebol")}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">⚽</div>
            <h3>Futebol</h3>
          </div>
          
          <div 
            className="category-card"
            onClick={() => startQuiz("novelas")}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">📺</div>
            <h3>Novelas</h3>
          </div>
        </div>
      </div>
    </>
  );
}
