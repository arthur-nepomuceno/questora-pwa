"use client";

import { QuizState, Screen, UserAnswer } from '@/types/quiz';

interface ReviewScreenProps {
  quizState: QuizState;
  setScreen: (screen: Screen) => void;
  timeRemaining: number;
}

export default function ReviewScreen({ quizState, setScreen, timeRemaining }: ReviewScreenProps) {

  return (
    <div className="blue-theme">
      {/* Logo Show do Milênio no estilo Show do Milhão */}
      <div className="show-milenio-logo">
        <h1>🎯 SHOW DO MILÊNIO</h1>
        <div className="coin-icon">
          📋
        </div>
      </div>

      {/* Review Header */}
      <div className="review-header">
        <h2>📋 Revisão dos Resultados</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setScreen("results")}
          >
            Voltar
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setScreen("calculations")}
          >
            Entenda os Cálculos
          </button>
        </div>
      </div>

      {/* Review List */}
      <div className="review-list">
        {/* Informational Box: Credits Calculation */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">ℹ️</div>
            <div className="question-text">
              <div style={{ fontWeight: 'bold' }}>Créditos ganhos</div>
              <div style={{ marginTop: '6px' }}>
                <div>- Valor acumulado: {quizState.accumulatedScore}</div>
                <div>- Segundos restantes: {timeRemaining}</div>
                <div>- Total de Créditos Ganhos: {quizState.accumulatedScore + timeRemaining}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Box: Points Calculation */}
        <div className="review-item">
          <div className="review-question">
            <div className="question-number">📊</div>
            <div className="question-text">
              <div style={{ fontWeight: 'bold' }}>Pontos da Rodada</div>
              <div style={{ marginTop: '6px' }}>
                <div>- Pontos por Acertos: {quizState.userAnswers.filter(answer => answer.isCorrect).reduce((sum, answer) => sum + answer.question.pontuacao, 0)}</div>
                <div>- Fator de Multiplicação: {quizState.selectedCredits / 100}</div>
                <div>- Total de pontos da rodada: {quizState.userAnswers.filter(answer => answer.isCorrect).reduce((sum, answer) => sum + (answer.question.pontuacao * (quizState.selectedCredits / 100)), 0)}</div>
              </div>
            </div>
          </div>
        </div>
        {quizState.userAnswers.map((answer: UserAnswer, index: number) => (
          <div
            key={index}
            className={`review-item ${answer.isCorrect ? 'correct' : 'wrong'}`}
          >
            {/* Question */}
            <div className="review-question">
              <div className="question-number">{index + 1}</div>
              <div className="question-text">{answer.question.pergunta}</div>
              <div style={{ 
                color: 'white', 
                fontWeight: 'bold',
                textDecoration: answer.isCorrect ? 'none' : 'line-through',
                textDecorationThickness: '2px'
              }}>
                {answer.question.pontuacao} PONTO{answer.question.pontuacao > 1 ? 'S' : ''}
              </div>
            </div>

            {/* Answers */}
            <div className="review-answers">
              {/* User Answer */}
              <div className={`user-answer ${answer.isCorrect ? 'correct' : 'wrong'}`}>
                <span>Sua resposta: {answer.userAnswer}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
