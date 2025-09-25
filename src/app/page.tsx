"use client";
import { useQuiz } from "@/hooks/useQuiz";
import ModalidadeScreen from "@/components/ModalidadeScreen";
import CategoryScreen from "@/components/CategoryScreen";
import ComingSoonScreen from "@/components/ComingSoonScreen";
import CreditsScreen from "@/components/CreditsScreen";
import QuizScreen from "@/components/QuizScreen";
import ResultsScreen from "@/components/ResultsScreen";
import ReviewScreen from "@/components/ReviewScreen";
import InstallPrompt from "@/components/InstallPrompt";

export default function Home() {
  const quizHook = useQuiz();

  return (
    <div className="quiz-container">
      {quizHook.currentScreen === "modalidade" && <ModalidadeScreen selectModalidade={quizHook.selectModalidade} />}
      {quizHook.currentScreen === "start" && <CategoryScreen startQuiz={quizHook.startQuiz} setScreen={quizHook.setScreen} />}
      {quizHook.currentScreen === "coming-soon" && (
        <ComingSoonScreen 
          modalidade={quizHook.selectedModalidade || ""} 
          goBack={quizHook.goBackToModalidade} 
        />
      )}
      {quizHook.currentScreen === "credits" && <CreditsScreen {...quizHook} />}
      {quizHook.currentScreen === "quiz" && (
        <QuizScreen 
          quizState={quizHook.quizState}
          timeRemaining={quizHook.timeRemaining}
          selectedOption={quizHook.selectedOption}
          showFeedback={quizHook.showFeedback}
          selectOption={quizHook.selectOption}
          MULTIPLIERS={quizHook.MULTIPLIERS}
        />
      )}
      {quizHook.currentScreen === "results" && <ResultsScreen {...quizHook} />}
      {quizHook.currentScreen === "review" && <ReviewScreen {...quizHook} />}
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}