"use client";

import { QuizState, Screen, UserAnswer } from '@/types/quiz';

interface ReviewScreenProps {
  quizState: QuizState;
  setScreen: (screen: Screen) => void;
}

export default function ReviewScreen({ quizState, setScreen }: ReviewScreenProps) {

  return (
    <>
      {/* Logo Show do Milênio no estilo Show do Milhão */}
      <div className="show-milenio-logo">
        <h1>🎯 SHOW DO MILÊNIO</h1>
        <div className="coin-icon">
          📋
        </div>
      </div>

      {/* Review Header */}
      <div className="review-header">
        <h2>📋 Revisão das Respostas</h2>
        <button
          className="btn btn-secondary"
          onClick={() => setScreen("results")}
        >
          Voltar aos Resultados
        </button>
      </div>

      {/* Review List */}
      <div className="review-list">
        {quizState.userAnswers.map((answer: UserAnswer, index: number) => (
          <div
            key={index}
            className={`review-item ${answer.isCorrect ? 'correct' : 'wrong'}`}
          >
            {/* Question */}
            <div className="review-question">
              <div className="question-number">{index + 1}</div>
              <div className="question-text">{answer.question.pergunta}</div>
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
    </>
  );
}
