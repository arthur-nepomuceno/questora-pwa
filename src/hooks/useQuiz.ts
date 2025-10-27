'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { QuizState, Question, UserAnswer, Screen, ConsentData } from '@/types/quiz';
import { questionsData } from '@/data/questions';
import { useAuth } from '@/hooks/useAuth';
import { useSounds } from '@/hooks/useSounds';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MULTIPLIERS = [.1, .2, .3, .4, .6, 1, 1.4, 2, 3, 6];

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
  totalPoints: 0,
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
  const [showLivreModal, setShowLivreModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const creditsRecalculatedRef = useRef(false);
  const { isAuthenticated, isLoading, user, updateCredits, updateTotalPoints, updateGameStats, updateTotalGames, updateCreditGames } = useAuth();
  const { playCorrectAnswer } = useSounds();

  const selectRandomQuestions = useCallback((category: string, forceMedium: boolean = false): Question[] => {
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
    
    if (forceMedium) {
      // Se deve forçar média, retorna uma pergunta média aleatória
      const randomMedium = shuffle([...mediumQuestions])[0];
      return randomMedium ? [randomMedium] : [];
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
    // Limpar timer anterior se existir
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    setTimeRemaining(60);
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Limpar timer e finalizar quiz
          if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
          }
          setCurrentScreen('results');
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
    // Se a modalidade já foi selecionada, vai direto para seleção de categoria
    if (selectedModalidade === 'competicao') {
      setCurrentScreen('start');
    } else {
      // Caso contrário, volta para seleção de modalidade
      setCurrentScreen('modalidade');
    }
  }, [selectedModalidade]);

  const startQuiz = useCallback((category: string) => {
    setPendingCategory(category);
    setShowConsentModal(true);
  }, []);

  const handleConsentConfirm = useCallback(async (consentData: ConsentData) => {
    try {
      // Salvar dados na coleção 'preusers' no Firebase
      await addDoc(collection(db, 'preusers'), {
        firstName: consentData.firstName,
        lastName: consentData.lastName,
        phone: consentData.phone,
        isAdult: consentData.isAdult,
        category: pendingCategory,
        timestamp: serverTimestamp(),
        createdAt: new Date(),
      });
      
      console.log('✅ Dados salvos na coleção preusers');
    } catch (error) {
      console.error('❌ Erro ao salvar dados na coleção preusers:', error);
      // Continuar mesmo se houver erro ao salvar
    }
    
    // Salvar dados de consentimento no estado do quiz
    setQuizState(prev => ({ ...prev, consentData }));
    setShowConsentModal(false);
    
    // Agora prosseguir com a seleção de perguntas e ir para créditos
    if (pendingCategory) {
      const selectedQuestions = selectRandomQuestions(pendingCategory);
      setQuizState(prev => ({
        ...prev,
        selectedQuestions,
        selectedCategory: pendingCategory,
      }));
      setCurrentScreen('credits');
      setPendingCategory(null);
    }
  }, [pendingCategory, selectRandomQuestions]);

  const handleConsentCancel = useCallback(() => {
    setShowConsentModal(false);
    setPendingCategory(null);
    // Manter na tela de escolha de categoria
  }, []);

  const startQuizWithCredits = useCallback(async (credits: number) => {
    
    setQuizState(prev => ({ ...prev, selectedCredits: credits }));
    
    // Resetar flag de recálculo para novo quiz
    creditsRecalculatedRef.current = false;
    
    // Debitar créditos imediatamente
    if (user) {
      const newCredits = user.totalCredits - credits;
      await updateCredits(newCredits);
      // Incrementar total de partidas
      await updateTotalGames();
      // Incrementar partidas por pacote de créditos
      await updateCreditGames(credits);
      // Armazenar o valor dos créditos após o débito para uso posterior
      setQuizState(prev => ({ ...prev, creditsAfterDebit: newCredits }));
    }
    
    // Verificar se deve mostrar modal para modalidade Livre com usuário não cadastrado
    if (selectedModalidade === 'livre' && !isAuthenticated) {
      setShowLivreModal(true);
    } else {
      startTimer();
      setCurrentScreen('quiz');
    }
  }, [startTimer, user, updateCredits, updateTotalGames, updateCreditGames, selectedModalidade, isAuthenticated]);

  const recalculateCredits = useCallback(async (currentAccumulatedScore?: number) => {
    // Usar o valor passado como parâmetro ou o valor atual do estado
    const accumulatedScore = currentAccumulatedScore !== undefined ? currentAccumulatedScore : quizState.accumulatedScore;
    
    
    if (user && !creditsRecalculatedRef.current) {
      // Marcar como já recalculado ANTES (síncrono, imediato)
      creditsRecalculatedRef.current = true;
      
      // Adicionar accumulatedScore + tempo restante aos créditos atuais (uma vez só)
      const newCredits = user.totalCredits + accumulatedScore + timeRemaining;
      
      await updateCredits(newCredits);
    } else {
    }
  }, [user, timeRemaining, updateCredits]);

  const savePoints = useCallback(async () => {
    if (user && quizState.totalPoints > 0) {
      await updateTotalPoints(quizState.totalPoints);
    }
  }, [user, quizState.totalPoints, updateTotalPoints]);

  const saveGameStats = useCallback(async () => {
    if (user) {
      await updateGameStats(quizState.correctAnswers, quizState.wrongAnswers);
    }
  }, [user, quizState.correctAnswers, quizState.wrongAnswers, updateGameStats]);

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

      // Determina se a próxima pergunta deve ser média
      let nextShouldBeMedium = shouldNextBeEasy;
      
      if (isCorrect) {
        newState.correctAnswers++;
        const currentMultiplier = MULTIPLIERS[newState.currentMultiplierIndex];
        const pointsEarned = newState.selectedCredits * currentMultiplier;
        const oldAccumulated = newState.accumulatedScore;
        newState.accumulatedScore = Math.round(newState.accumulatedScore + pointsEarned);
        
        // Tocar som de resposta correta
        playCorrectAnswer();
        
        // Adicionar pontos da questão ao total
        newState.totalPoints += currentQuestion.pontuacao * (newState.selectedCredits / 100);
        
        if (newState.currentMultiplierIndex < MULTIPLIERS.length - 1) {
          newState.currentMultiplierIndex++;
        }
        
        // Se acertou e estava marcado para próxima ser média, limpa o flag
        if (shouldNextBeEasy) {
          nextShouldBeMedium = false;
          setShouldNextBeEasy(false);
        }
      } else {
        newState.wrongAnswers++;
        newState.currentErrors++;
        const oldAccumulated = newState.accumulatedScore;
        newState.accumulatedScore = Math.round(newState.accumulatedScore / 2);
        newState.currentMultiplierIndex = 0;
        
        // Se errou, marca que a próxima pergunta deve ser média
        nextShouldBeMedium = true;
        setShouldNextBeEasy(true);
      }

      // Se a próxima pergunta deve ser média, substitui ela agora
      const nextIndex = newState.currentQuestionIndex + 1;
      if (nextShouldBeMedium && nextIndex < newState.selectedQuestions.length && newState.selectedQuestions[nextIndex]?.dificuldade !== 'medio') {
        // Pegar todas as perguntas médias da categoria
        const allMediumQuestions = questionsData[newState.selectedCategory!].filter(q => q.dificuldade === 'medio');
        
        // Pegar IDs das perguntas já usadas (incluindo a atual e as já respondidas)
        const usedQuestionIds = new Set([
          ...newState.selectedQuestions.slice(0, nextIndex + 1).map(q => q.id),
          ...newState.userAnswers.map(answer => answer.question.id)
        ]);
        
        // Usar função utilitária para obter perguntas médias disponíveis
        const availableMediumQuestions = getAvailableQuestions(allMediumQuestions, usedQuestionIds);
        
        // Se ainda há perguntas médias disponíveis, escolher uma aleatória
        if (availableMediumQuestions.length > 0) {
          const randomMedium = availableMediumQuestions[Math.floor(Math.random() * availableMediumQuestions.length)];
          const newQuestions = [...newState.selectedQuestions];
          newQuestions[nextIndex] = randomMedium;
          
          // Verificar se a nova seleção não tem duplicatas ANTES de aplicar
          if (!hasDuplicateQuestions(newQuestions)) {
            newState.selectedQuestions = newQuestions;
          } else {
            console.error('Pergunta duplicada detectada após substituição! Mantendo pergunta original.');
            // Manter a pergunta original se houver duplicata
          }
        }
        // Se não há mais perguntas médias disponíveis, mantém a pergunta original
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
          recalculateCredits(prev.accumulatedScore);
          // Salvar pontos antes de ir para resultados
          savePoints();
          // Salvar estatísticas antes de ir para resultados
          saveGameStats();
          setCurrentScreen('results');
          return prev;
        } else {
          // Avançar para próxima pergunta
          const newIndex = prev.currentQuestionIndex + 1;
          if (newIndex > prev.selectedQuestions.length - 1) {
            stopTimer();
            // Recalcular créditos antes de ir para resultados
            recalculateCredits(prev.accumulatedScore);
            // Salvar pontos antes de ir para resultados
            savePoints();
            // Salvar estatísticas antes de ir para resultados
            saveGameStats();
            setCurrentScreen('results');
            return prev;
          }
          
          return { ...prev, currentQuestionIndex: newIndex };
        }
      });
    }, 500);
  }, [quizState.maxErrors, quizState.selectedQuestions, quizState.currentQuestionIndex, shouldNextBeEasy, stopTimer, recalculateCredits, savePoints, saveGameStats, playCorrectAnswer]);

  const endQuizByTime = useCallback(async () => {
    stopTimer();
    await recalculateCredits(quizState.accumulatedScore);
    await savePoints();
    await saveGameStats();
    setCurrentScreen('results');
  }, [stopTimer, recalculateCredits, quizState.accumulatedScore, savePoints, saveGameStats]);

  const goBackToModalidade = useCallback(() => {
    setSelectedModalidade(null);
    setCurrentScreen('modalidade');
  }, []);

  const restartQuiz = useCallback(() => {
    stopTimer();
    setQuizState(initialQuizState);
    setSelectedOption(null);
    setShowFeedback(false);
    
    // Se o usuário estiver logado, vai direto para escolha de categoria
    if (isAuthenticated) {
      setCurrentScreen('start');
    } else {
      // Se não estiver logado, volta para modalidade
      setCurrentScreen('modalidade');
      setSelectedModalidade(null);
    }
    
    // Resetar flag de recálculo
    creditsRecalculatedRef.current = false;
  }, [stopTimer, isAuthenticated]);

  const setScreen = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const goToOptions = useCallback(() => {
    setCurrentScreen('options');
  }, []);

  const closeLivreModal = useCallback(() => {
    setShowLivreModal(false);
    startTimer();
    setCurrentScreen('quiz');
  }, [startTimer]);

  const setSelectedCredits = useCallback((credits: number) => {
    setQuizState(prev => ({ ...prev, selectedCredits: credits }));
  }, []);

  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
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
    showLivreModal,
    showConsentModal,
    handleConsentConfirm,
    handleConsentCancel,
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
    closeLivreModal,
    MULTIPLIERS,
  };
};
