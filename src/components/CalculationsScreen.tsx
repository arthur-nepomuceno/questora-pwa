"use client";

import { useState } from 'react';
import { Screen } from '@/types/quiz';

interface CalculationsScreenProps {
  setScreen: (screen: Screen) => void;
}

export default function CalculationsScreen({ setScreen }: CalculationsScreenProps) {
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (itemKey: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };
  return (
    <div className="blue-theme">
      {/* Logo Show do Milênio no estilo Show do Milhão */}
      <div className="show-milenio-logo">
	    <h1>🎯 <span style={{ fontSize: '1.25em', lineHeight: 1, display: 'inline-block' }}>S</span>HOW DO MILÊNIO</h1>
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

        {/* Total de Créditos Ganhos */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">🎯</div>
            <div className="question-text">
              <div 
                style={{ fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => toggleItem('totalCreditos')}
              >
                Total de Créditos Ganhos {expandedItems.totalCreditos ? '▲' : '▼'}
              </div>
              {expandedItems.totalCreditos && (
                <div style={{ marginTop: '6px', textAlign: 'left', textTransform: 'none' }}>
                  <div>Fórmula: Valor Acumulado + Segundos Restantes</div>
                  <div>• Exemplo: Se acumulou 250 créditos e restaram 43 segundos = 293 créditos</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Valor Acumulado */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">💰</div>
            <div className="question-text">
              <div 
                style={{ fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => toggleItem('valorAcumulado')}
              >
                Valor Acumulado {expandedItems.valorAcumulado ? '▲' : '▼'}
              </div>
              {expandedItems.valorAcumulado && (
                <div style={{ marginTop: '6px', textAlign: 'left', textTransform: 'none' }}>
                  <div>Fórmula: Pacote de Créditos × Multiplicador.</div>
                  <div>• Multiplicadores: 0.10, 0.20, 0.30, 0.40, 0.60, 1.00, 1.40, 2.00, 3.00, 6.00.</div>
                  <div>• A cada acerto, o multiplicador aumenta.</div>
                  <div>• A cada erro, o valor é dividido por 2 e multiplicador volta ao início.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Segundos Restantes */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">⏱️</div>
            <div className="question-text">
              <div 
                style={{ fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => toggleItem('segundosRestantes')}
              >
                Segundos Restantes {expandedItems.segundosRestantes ? '▲' : '▼'}
              </div>
              {expandedItems.segundosRestantes && (
                <div style={{ marginTop: '6px', textAlign: 'left', textTransform: 'none' }}>
                  <div>Representa o tempo que sobrou quando o quiz foi finalizado</div>
                  <div>• Inicia com 60 segundos.</div>
                  <div>• Quando chega a 0, o quiz é finalizado automaticamente</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pontos da Rodada */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">🏆</div>
            <div className="question-text">
              <div 
                style={{ fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => toggleItem('pontosRodada')}
              >
                Total de Pontos da Rodada {expandedItems.pontosRodada ? '▲' : '▼'}
              </div>
              {expandedItems.pontosRodada && (
                <div style={{ marginTop: '6px', textAlign: 'left', textTransform: 'none' }}>
                  <div>Fórmula: Pontos por Acertos × Fator de Multiplicação</div>
                  <div>• Exemplo: 9 pontos por acertos × (pacote de 700 créditos / 100) = 9 × 7 = 63 pontos.</div>
                  <div>• Exemplo: 11 pontos por acertos × (pacote de 500 créditos /100) = 11 × 5 = 55 pontos.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pontos por Acertos */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">⭐</div>
            <div className="question-text">
              <div 
                style={{ fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => toggleItem('pontosAcertos')}
              >
                Pontos por Acertos {expandedItems.pontosAcertos ? '▲' : '▼'}
              </div>
              {expandedItems.pontosAcertos && (
                <div style={{ marginTop: '6px', textAlign: 'left', textTransform: 'none' }}>
                  <div>É o resultado da soma dos pontos de todas as respostas certas.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fator de Multiplicação */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">📊</div>
            <div className="question-text">
              <div 
                style={{ fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => toggleItem('fatorMultiplicacao')}
              >
                Fator de Multiplicação {expandedItems.fatorMultiplicacao ? '▲' : '▼'}
              </div>
              {expandedItems.fatorMultiplicacao && (
                <div style={{ marginTop: '6px', textAlign: 'left', textTransform: 'none' }}>
                  <div>Fórmula: Pacote de Créditos / 100</div>
                  <div>• Pacote de 100 créditos = Fator 1.</div>
                  <div>• Pacote de 500 créditos = Fator 5.</div>
                  <div>• Pacote de 700 créditos = Fator 7.</div>
                  <div>• Pacote de 1000 créditos = Fator 10.</div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
