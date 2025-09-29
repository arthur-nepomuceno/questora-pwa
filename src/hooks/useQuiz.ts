'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { QuizState, Question, UserAnswer, Screen } from '@/types/quiz';
import { questionsData } from '@/data/questions';
import { useAuth } from '@/hooks/useAuth';

const MULTIPLIERS = [0.10, 0.20, 0.30, 0.40, 0.60, 1.00, 1.40, 2.00, 3.00, 6.00];

const initialQuizState: QuizState = {
  selectedQuestions: [],
  currentQuestionIndex: 0,
  userAnswers: [],
  correctAnswers: 0,
  wrongAnswers: 0,
  selectedCategory: null,
  selectedCredits: 100,
  accumulatedScore: 0,
  currentMultiplierIndex: 0,
  maxErrors: 3,
  currentErrors: 0,
};

// Função utilitária para verificar perguntas duplicadas
const hasDuplicateQuestions = (questions: Question[]): boolean => {
  const ids = questions.map(q => q.id);
  return ids.length !== new Set(ids).size;
};

// Função utilitária para obter perguntas disponíveis (não usadas)
const getAvailableQuestions = (
  allQuestions: Question[], 
  usedQuestionIds: Set<number>
): Question[] => {
  return allQuestions.filter(q => !usedQuestionIds.has(q.id));
};

export const useQuiz = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('modalidade');
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shouldNextBeEasy, setShouldNextBeEasy] = useState(false);
  const [selectedModalidade, setSelectedModalidade] = useState<string | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const creditsRecalculatedRef = useRef(false);
  const { isAuthenticated, isLoading, user, updateCredits } = useAuth();

  const selectRandomQuestions = useCallback((category: string, forceEasy: boolean = false): Question[] => {
    const categoryQuestions = questionsData[category];
    const easyQuestions = categoryQuestions.filter(q => q.dificuldade === 'facil');
    const mediumQuestions = categoryQuestions.filter(q => q.dificuldade === 'medio');
    const hardQuestions = categoryQuestions.filter(q => q.dificuldade === 'dificil');

    const shuffle = (array: Question[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    if (forceEasy) {
      // Se deve forçar fácil, retorna uma pergunta fácil aleatória
      const randomEasy = shuffle([...easyQuestions])[0];
      return randomEasy ? [randomEasy] : [];
    }
    
    // Garantir que temos perguntas suficientes de cada dificuldade
    if (easyQuestions.length < 3 || mediumQuestions.length < 3 || hardQuestions.length < 4) {
      console.warn('Não há perguntas suficientes de alguma dificuldade na categoria:', category);
      return [];
    }
    
    // Selecionar perguntas únicas de cada dificuldade
    const selectedEasy = shuffle([...easyQuestions]).slice(0, 3);
    const selectedMedium = shuffle([...mediumQuestions]).slice(0, 3);
    const selectedHard = shuffle([...hardQuestions]).slice(0, 4);

    // Verificar se todas as perguntas selecionadas são únicas
    const allSelectedQuestions = [...selectedEasy, ...selectedMedium, ...selectedHard];
    
    if (hasDuplicateQuestions(allSelectedQuestions)) {
      console.error('Perguntas duplicadas detectadas na seleção inicial!');
      return [];
    }

    return [
      ...selectedEasy.slice(0, 2),  // Questões 1-2: fáceis
      selectedEasy[2],              // Questão 3: fácil
      selectedMedium[0],            // Questão 4: média
      ...selectedHard.slice(0, 2),  // Questões 5-6: difíceis
      selectedMedium[1],            // Questão 7: média
      ...selectedHard.slice(2, 4),  // Questões 8-9: difíceis
      selectedMedium[2]             // Questão 10: média
    ];
  }, []);

  const startTimer = useCallback(() => {
    setTimeRemaining(60);
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endQuizByTime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, []);

  const selectModalidade = useCallback((modalidade: string) => {
    setSelectedModalidade(modalidade);
    
    if (modalidade === 'livre') {
      setCurrentScreen('start');
    } else if (modalidade === 'competicao') {
      // Se já está autenticado, vai direto para a seleção de categoria
      if (isAuthenticated) {
        setCurrentScreen('start');
      } else {
        setCurrentScreen('auth');
      }
    } else {
      setCurrentScreen('coming-soon');
    }
  }, [isAuthenticated]);

  const goToCompetition = useCallback(() => {
    setCurrentScreen('start'); // Após autenticação, vai para seleção de categoria
  }, []);

  const startQuiz = useCallback((category: string) => {
    const selectedQuestions = selectRandomQuestions(category);
    setQuizState({
      ...initialQuizState,
      selectedQuestions,
      selectedCategory: category,
    });
    setCurrentScreen('credits');
  }, [selectRandomQuestions]);

  const startQuizWithCredits = useCallback(async (credits: number) => {
    console.log('🚀 startQuizWithCredits chamado:', {
      credits,
      user: !!user,
      userCredits: user?.credits,
      timestamp: new Date().toISOString()
    });
    
    setQuizState(prev => ({ ...prev, selectedCredits: credits }));
    
    // Resetar flag de recálculo para novo quiz
    creditsRecalculatedRef.current = false;
    
    // Debitar créditos imediatamente
    if (user) {
      const newCredits = user.credits - credits;
      console.log('💳 Debitando créditos:', {
        oldCredits: user.credits,
        debitAmount: credits,
        newCredits: newCredits
      });
      await updateCredits(newCredits);
      // Armazenar o valor dos créditos após o débito para uso posterior
      setQuizState(prev => ({ ...prev, creditsAfterDebit: newCredits }));
    }
    
    console.log('⏰ Iniciando timer e mudando para tela quiz');
    startTimer();
    setCurrentScreen('quiz');
  }, [startTimer, user, updateCredits]);

  const recalculateCredits = useCallback(async (currentAccumulatedScore?: number) => {
    // Usar o valor passado como parâmetro ou o valor atual do estado
    const accumulatedScore = currentAccumulatedScore !== undefined ? currentAccumulatedScore : quizState.accumulatedScore;
    
    console.log('🔍 recalculateCredits chamado:', {
      user: !!user,
      creditsRecalculatedRef: creditsRecalculatedRef.current,
      userCredits: user?.credits,
      accumulatedScore: accumulatedScore,
      timeRemaining: timeRemaining,
      timestamp: new Date().toISOString()
    });
    
    if (user && !creditsRecalculatedRef.current) {
      console.log('✅ Executando recálculo de créditos');
      
      // Marcar como já recalculado ANTES (síncrono, imediato)
      creditsRecalculatedRef.current = true;
      
      // Adicionar accumulatedScore + tempo restante aos créditos atuais (uma vez só)
      const newCredits = user.credits + accumulatedScore + timeRemaining;
      console.log('💰 Cálculo final:', {
        userCredits: user.credits,
        accumulatedScore: accumulatedScore,
        timeRemaining: timeRemaining,
        newCredits: newCredits,
        formula: `${user.credits} + ${accumulatedScore} + ${timeRemaining} = ${newCredits}`
      });
      
      await updateCredits(newCredits);
      console.log('✅ updateCredits concluído');
    } else {
      console.log('❌ recalculateCredits bloqueado:', {
        reason: !user ? 'sem usuário' : 'já recalculado'
      });
    }
  }, [user, timeRemaining, updateCredits]);

  const selectOption = useCallback((option: string) => {
    const currentQuestion = quizState.selectedQuestions[quizState.currentQuestionIndex];
    const isCorrect = option === currentQuestion.correta;
    
    // Mostrar feedback visual
    setSelectedOption(option);
    setShowFeedback(true);
    
    const userAnswer: UserAnswer = {
      question: currentQuestion,
      userAnswer: option,
      isCorrect,
    };

    setQuizState(prev => {
      const newState = { ...prev };
      newState.userAnswers = [...prev.userAnswers, userAnswer];

      // Determina se a próxima pergunta deve ser fácil
      let nextShouldBeEasy = shouldNextBeEasy;
      
      if (isCorrect) {
        newState.correctAnswers++;
        const currentMultiplier = MULTIPLIERS[newState.currentMultiplierIndex];
        const pointsEarned = newState.selectedCredits * currentMultiplier;
        const oldAccumulated = newState.accumulatedScore;
        newState.accumulatedScore = Math.round(newState.accumulatedScore + pointsEarned);
        console.log('📈 Acumulado atualizado (acerto):', {
          oldAccumulated,
          pointsEarned,
          newAccumulated: newState.accumulatedScore,
          multiplier: currentMultiplier,
          selectedCredits: newState.selectedCredits
        });
        
        if (newState.currentMultiplierIndex < MULTIPLIERS.length - 1) {
          newState.currentMultiplierIndex++;
        }
        
        // Se acertou e estava marcado para próxima ser fácil, limpa o flag
        if (shouldNextBeEasy) {
          nextShouldBeEasy = false;
          setShouldNextBeEasy(false);
        }
      } else {
        newState.wrongAnswers++;
        newState.currentErrors++;
        const oldAccumulated = newState.accumulatedScore;
        newState.accumulatedScore = Math.round(newState.accumulatedScore / 2);
        console.log('📉 Acumulado atualizado (erro):', {
          oldAccumulated,
          newAccumulated: newState.accumulatedScore
        });
        newState.currentMultiplierIndex = 0;
        
        // Se errou, marca que a próxima pergunta deve ser fácil
        nextShouldBeEasy = true;
        setShouldNextBeEasy(true);
      }

      // Se a próxima pergunta deve ser fácil, substitui ela agora
      const nextIndex = newState.currentQuestionIndex + 1;
      if (nextShouldBeEasy && nextIndex < newState.selectedQuestions.length && newState.selectedQuestions[nextIndex]?.dificuldade !== 'facil') {
        // Pegar todas as perguntas fáceis da categoria
        const allEasyQuestions = questionsData[newState.selectedCategory!].filter(q => q.dificuldade === 'facil');
        
        // Pegar IDs das perguntas já usadas (incluindo a atual e as já respondidas)
        const usedQuestionIds = new Set([
          ...newState.selectedQuestions.slice(0, nextIndex + 1).map(q => q.id),
          ...newState.userAnswers.map(answer => answer.question.id)
        ]);
        
        // Usar função utilitária para obter perguntas fáceis disponíveis
        const availableEasyQuestions = getAvailableQuestions(allEasyQuestions, usedQuestionIds);
        
        // Se ainda há perguntas fáceis disponíveis, escolher uma aleatória
        if (availableEasyQuestions.length > 0) {
          const randomEasy = availableEasyQuestions[Math.floor(Math.random() * availableEasyQuestions.length)];
          const newQuestions = [...newState.selectedQuestions];
          newQuestions[nextIndex] = randomEasy;
          newState.selectedQuestions = newQuestions;
          
          // Verificar se a nova seleção não tem duplicatas
          if (hasDuplicateQuestions(newState.selectedQuestions)) {
            console.error('Pergunta duplicada detectada após substituição!');
            // Reverter a mudança se houver duplicata
            newState.selectedQuestions = [...newState.selectedQuestions];
          }
        }
        // Se não há mais perguntas fáceis disponíveis, mantém a pergunta original
      }

      return newState;
    });

    // Limpar feedback e avançar após delay
    setTimeout(() => {
      setSelectedOption(null);
      setShowFeedback(false);
      
      // Verificar se atingiu 3 erros usando o estado atualizado
      setQuizState(prev => {
        if (prev.currentErrors >= prev.maxErrors) {
          stopTimer();
          // Recalcular créditos antes de ir para resultados
          console.log('🚨 Chamando recalculateCredits por LIMITE DE ERROS');
          recalculateCredits(prev.accumulatedScore);
          setCurrentScreen('results');
          return prev;
        } else {
          // Avançar para próxima pergunta
          const newIndex = prev.currentQuestionIndex + 1;
          if (newIndex > prev.selectedQuestions.length - 1) {
            stopTimer();
            // Recalcular créditos antes de ir para resultados
            console.log('🏁 Chamando recalculateCredits por FIM DAS PERGUNTAS');
            recalculateCredits(prev.accumulatedScore);
            setCurrentScreen('results');
            return prev;
          }
          
          return { ...prev, currentQuestionIndex: newIndex };
        }
      });
    }, 500);
  }, [quizState.maxErrors, quizState.selectedQuestions, quizState.currentQuestionIndex, shouldNextBeEasy, stopTimer, recalculateCredits]);

  const endQuizByTime = useCallback(async () => {
    stopTimer();
    console.log('⏰ Chamando recalculateCredits por TEMPO ESGOTADO');
    await recalculateCredits(quizState.accumulatedScore);
    setCurrentScreen('results');
  }, [stopTimer, recalculateCredits]);

  const goBackToModalidade = useCallback(() => {
    setSelectedModalidade(null);
    setCurrentScreen('modalidade');
  }, []);

  const restartQuiz = useCallback(() => {
    stopTimer();
    setQuizState(initialQuizState);
    setSelectedOption(null);
    setShowFeedback(false);
    setCurrentScreen('modalidade');
    setSelectedModalidade(null);
    // Resetar flag de recálculo
    creditsRecalculatedRef.current = false;
  }, [stopTimer]);

  const setScreen = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const goToOptions = useCallback(() => {
    setCurrentScreen('options');
  }, []);

  const setSelectedCredits = useCallback((credits: number) => {
    setQuizState(prev => ({ ...prev, selectedCredits: credits }));
  }, []);

  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);


  return {
    currentScreen,
    quizState,
    timeRemaining,
    selectedOption,
    showFeedback,
    selectedModalidade,
    setScreen,
    setSelectedCredits,
    selectModalidade,
    goBackToModalidade,
    goToCompetition,
    goToOptions,
    startQuiz,
    startQuizWithCredits,
    selectOption,
    restartQuiz,
    MULTIPLIERS,
  };
};
