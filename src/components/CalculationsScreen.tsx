"use client";

import { Screen } from '@/types/quiz';

interface CalculationsScreenProps {
  setScreen: (screen: Screen) => void;
}

export default function CalculationsScreen({ setScreen }: CalculationsScreenProps) {
  return (
    <div className="blue-theme">
      {/* Logo Show do Milênio no estilo Show do Milhão */}
      <div className="show-milenio-logo">
        <h1>🎯 SHOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🧮
        </div>
      </div>

      {/* Calculations Header */}
      <div className="review-header">
        <h2>🧮 Entenda os Cálculos</h2>
        <button
          className="btn btn-secondary"
          onClick={() => setScreen("review")}
        >
          Voltar
        </button>
      </div>

      {/* Calculations Content */}
      <div className="review-list" style={{ textAlign: 'left' }}>
        
        {/* Valor Acumulado */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">💰</div>
            <div className="question-text">
              <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Valor Acumulado</div>
              <div style={{ marginTop: '6px', textAlign: 'left' }}>
                <div>Fórmula: Pacote de Créditos × Multiplicador.</div>
                <div>• Multiplicadores: 0.10, 0.20, 0.30, 0.40, 0.60, 1.00, 1.40, 2.00, 3.00, 6.00.</div>
                <div>• A cada acerto, o multiplicador aumenta.</div>
                <div>• A cada erro, o valor é dividido por 2 e multiplicador volta ao início.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Segundos Restantes */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">⏱️</div>
            <div className="question-text">
              <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Segundos Restantes</div>
              <div style={{ marginTop: '6px', textAlign: 'left' }}>
                <div>Representa o tempo que sobrou quando o quiz foi finalizado</div>
                <div>• Inicia com 60 segundos.</div>
                <div>• Quando chega a 0, o quiz é finalizado automaticamente</div>
              </div>
            </div>
          </div>
        </div>

        {/* Total de Créditos Ganhos */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">🎯</div>
            <div className="question-text">
              <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Total de Créditos Ganhos</div>
              <div style={{ marginTop: '6px', textAlign: 'left' }}>
                <div>Fórmula: Valor Acumulado + Segundos Restantes</div>
                <div>• Exemplo: Se acumulou 250 e restaram 43 segundos = 293 créditos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pontos por Acertos */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">⭐</div>
            <div className="question-text">
              <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Pontos por Acertos</div>
              <div style={{ marginTop: '6px', textAlign: 'left' }}>
                <div>É o resultado da soma dos pontos de todas as perguntas acertadas.</div>
                <div>• Perguntas fáceis: 1 ponto</div>
                <div>• Perguntas médias: 2 pontos</div>
                <div>• Perguntas difíceis: 3 pontos</div>
                <div>• Apenas perguntas acertadas contam pontos.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fator de Multiplicação */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">📊</div>
            <div className="question-text">
              <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Fator de Multiplicação</div>
              <div style={{ marginTop: '6px', textAlign: 'left' }}>
                <div>Fórmula: Pacote de Créditos / 100</div>
                <div>• Exemplo: Pacote de 500 créditos = Fator 5.</div>
                <div>• Exemplo: Pacote de 700 créditos = Fator 7.</div>
                <div>• Exemplo: Pacote de 1000 créditos = Fator 10.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pontos da Rodada */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">🏆</div>
            <div className="question-text">
              <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Pontos da Rodada</div>
              <div style={{ marginTop: '6px', textAlign: 'left' }}>
                <div>Fórmula: Pontos por Acertos × Fator de Multiplicação</div>
                <div>• Exemplo: 9 pontos por acertos × (700/100) = 9 × 7 = 63 pontos.</div>
                <div>• Exemplo: 11 pontos por acertos × (500/100) = 11 × 5 = 55 pontos.</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
