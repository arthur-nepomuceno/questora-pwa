"use client";
import React, { useState, useEffect } from "react";

interface QuizScreenProps {
  quizState: any;
  timeRemaining: number;
  selectedOption: string | null;
  showFeedback: boolean;
  selectOption: (option: string) => void;
  MULTIPLIERS: number[];
}

export default function QuizScreen({ 
  quizState,
  timeRemaining,
  selectedOption,
  showFeedback,
  selectOption,
  MULTIPLIERS
}: QuizScreenProps) {

  const currentQuestion = quizState.selectedQuestions[quizState.currentQuestionIndex];
  const totalQuestions = quizState.selectedQuestions.length;
  
  // Estado para controlar visibilidade dos valores
  const [showValues, setShowValues] = useState(true);
  const [currentMultiplier, setCurrentMultiplier] = useState(MULTIPLIERS[quizState.currentMultiplierIndex]);
  const [currentAccumulated, setCurrentAccumulated] = useState(quizState.accumulatedScore);
  
  // Atualiza os valores quando uma nova pergunta carrega
  useEffect(() => {
    setCurrentMultiplier(MULTIPLIERS[quizState.currentMultiplierIndex]);
    setCurrentAccumulated(quizState.accumulatedScore);
    setShowValues(true);
  }, [quizState.currentQuestionIndex, MULTIPLIERS, quizState.currentMultiplierIndex, quizState.accumulatedScore]);

  // Randomizar as opções para cada pergunta
  const shuffledOptions = React.useMemo(() => {
    if (!currentQuestion) return [];
    return [...currentQuestion.opcoes].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatScore = (score: number) => {
    return score.toFixed(2);
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

      {/* Layout principal com 67% esquerda e 33% direita */}
      <div className="quiz-main-layout">
        {/* Área esquerda - Pergunta e Opções (67%) */}
        <div className="quiz-content-left">
          {/* Indicadores Mobile - Lado a lado acima da pergunta */}
          <div className="mobile-indicators-row">
            {/* Indicador de pergunta */}
            <div className="question-indicator mobile-indicator">
              <div className="indicator-icon">📝</div>
              <div className="indicator-text">
                {quizState.currentQuestionIndex + 1}/{totalQuestions}
              </div>
            </div>

            {/* Timer */}
            <div className="timer-display mobile-indicator">
              <div className="timer-icon">⏰</div>
              <div className="timer-text">{formatTime(timeRemaining)}</div>
            </div>
          </div>

          {/* Caixa da pergunta */}
          {currentQuestion && (
            <div className="question-box">
              <div 
                className={`difficulty-badge difficulty-${currentQuestion.dificuldade}`}
              >
                {currentQuestion.dificuldade === 'facil' ? 'FÁCIL' : 
                 currentQuestion.dificuldade === 'medio' ? 'MÉDIO' : 'DIFÍCIL'}
              </div>
              <div className="question-text">
                {currentQuestion.pergunta}
              </div>
            </div>
          )}

          {/* Container das alternativas */}
          <div className="alternatives-container">
            {shuffledOptions.map((opcao, index) => {
              let alternativeClass = "alternative-box";
              
              if (showFeedback && selectedOption === opcao) {
                const isCorrect = opcao === currentQuestion.correta;
                alternativeClass += isCorrect ? " correct-feedback" : " wrong-feedback";
              }
              
              return (
                <div
                  key={index}
                  className={alternativeClass}
                  onClick={() => !showFeedback && selectOption(opcao)}
                  style={{ cursor: showFeedback ? 'not-allowed' : 'pointer' }}
                >
                  <div className="option-number">
                    {index + 1}
                  </div>
                  <div className="alternative-text">
                    {opcao}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Caixas do multiplicador e acumulado para mobile/tablet */}
          <div className="mobile-score-boxes">
            {/* Multiplicador */}
            <div className="mobile-multiplier-box">
              <div className="multiplier-icon">💰</div>
              <div className="multiplier-text">
                <div className="multiplier-label">Multiplicador</div>
                <div className="multiplier-value">
                  {showValues ? `${currentMultiplier}x` : '---'}
                </div>
              </div>
            </div>

            {/* Valor Acumulado */}
            <div className="mobile-accumulated-box">
              <div className="accumulated-icon">🏆</div>
              <div className="accumulated-text">
                <div className="accumulated-label">Acumulado</div>
                <div className="accumulated-value-number">
                  {showValues ? formatScore(currentAccumulated) : '---'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Área direita - Indicadores (33%) - Apenas desktop */}
        <div className="quiz-sidebar-right desktop-only">
          {/* Indicador de pergunta */}
          <div className="question-indicator">
            <div className="indicator-icon">📝</div>
            <div className="indicator-text">
              Pergunta {quizState.currentQuestionIndex + 1} de {totalQuestions}
            </div>
          </div>

          {/* Timer */}
          <div className="timer-display">
            <div className="timer-icon">⏰</div>
            <div className="timer-text">{formatTime(timeRemaining)}</div>
          </div>

          {/* Multiplicador atual */}
          <div className="current-multiplier">
            <div className="multiplier-icon">💰</div>
            <div className="multiplier-text">
              <div className="multiplier-label">Multiplicador</div>
              <div className="multiplier-value">
                {showValues ? `${currentMultiplier}x` : '---'}
              </div>
            </div>
          </div>

          {/* Valor Acumulado */}
          <div className="accumulated-value">
            <div className="accumulated-icon">🏆</div>
            <div className="accumulated-text">
              <div className="accumulated-label">Acumulado</div>
              <div className="accumulated-value-number">
                {showValues ? formatScore(currentAccumulated) : '---'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
