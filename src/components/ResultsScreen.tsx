"use client";

import { useEffect } from "react";
import { useSounds } from "@/hooks/useSounds";

interface ResultsScreenProps {
  quizState: any;
  timeRemaining: number;
  setScreen: (screen: any) => void;
  restartQuiz: () => void;
  selectedModalidade: string | null;
}

export default function ResultsScreen({ 
  quizState,
  timeRemaining,
  setScreen,
  restartQuiz,
  selectedModalidade
}: ResultsScreenProps) {

  // Hook de sons
  const { playEndGame } = useSounds();

  // Tocar som de fim de jogo quando componente monta
  useEffect(() => {
    playEndGame();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatScore = (score: number) => {
    return Math.round(score).toString();
  };

  const getEndMessage = () => {
    if (quizState.currentErrors >= quizState.maxErrors) {
      return "Não desista! Pratique mais e você vai melhorar! (Rodada encerrada por atingir 3 erros)";
    } else if (timeRemaining === 0) {
      return "Tempo esgotado! Tente responder mais rapidamente na próxima vez!";
    } else {
      return "Parabéns! Você completou todas as perguntas!";
    }
  };

  return (
    <div className="blue-theme">
      {/* Logo Show do Milênio no estilo Show do Milhão */}
      <div className="show-milenio-logo">
	    <h1>🎯 <span style={{ fontSize: '1.25em', lineHeight: 1, display: 'inline-block' }}>S</span>HOW DO MILÊNIO</h1>
        <div className="coin-icon">
          🏆
        </div>
      </div>

      {/* Main Card */}
      <div className="results-card">
        <h2>🎉 Quiz Finalizado!</h2>
        <p className="quiz-end-message">☝️ {getEndMessage()}</p>

        {/* Statistics Grid - Layout 2x2 + 1 centralizado */}
        <div className="results-details">
          {/* Primeira linha: Acertos e Erros */}
          <div className="result-square result-acertos">
            <div className="result-info">
              <span className="result-label">Acertos</span>
              <span className="result-value correct">{quizState.correctAnswers}</span>
            </div>
          </div>
          
          <div className="result-square result-erros">
            <div className="result-info">
              <span className="result-label">Erros</span>
              <span className="result-value wrong">{quizState.wrongAnswers}</span>
            </div>
          </div>
          
          {/* Segunda linha: Acumulado e Tempo Restante */}
          <div className="result-square result-acumulado">
            <div className="result-info">
              <span className="result-label">Acumulado</span>
              <span className="result-value">{formatScore(quizState.accumulatedScore)}</span>
            </div>
          </div>
          
          <div className="result-square result-tempo">
            <div className="result-info">
              <span className="result-label">Tempo Restante</span>
              <span className="result-value">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          
          {/* Terceira linha: Pontos e Créditos Ganhos */}
          <div className="result-square result-pontos">
            <div className="result-info">
              <span className="result-label">+Pontos</span>
              {selectedModalidade === 'livre' && (
                <div className="credits-message">
                  <small>(Cadastre-se para acumular pontos)</small>
                </div>
              )}
              <span className="result-value">+{quizState.totalPoints}</span>
            </div>
          </div>
          
          <div className="result-square result-creditos-ganhos">
            <div className="result-info">
              <span className="result-label">+Créditos</span>
              {selectedModalidade === 'livre' && (
                <div className="credits-message">
                  <small>(Cadastre-se para acumular créditos)</small>
                </div>
              )}
              <span className="result-value">+{formatScore(quizState.accumulatedScore + timeRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button
            className="btn btn-primary"
            onClick={restartQuiz}
          >
            Fazer Novo Quiz
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => setScreen("review")}
          >
            Revisar Resultados
          </button>
        </div>
      </div>
    </div>
  );
}
