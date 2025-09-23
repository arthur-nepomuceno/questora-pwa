"use client";
import { useQuiz } from "@/hooks/useQuiz";
import StartScreen from "@/components/StartScreen";
import CreditsScreen from "@/components/CreditsScreen";
import QuizScreen from "@/components/QuizScreen";
import ResultsScreen from "@/components/ResultsScreen";
import ReviewScreen from "@/components/ReviewScreen";
import InstallPrompt from "@/components/InstallPrompt";

export default function Home() {
  const quizHook = useQuiz();

  return (
    <div className="quiz-container">
      {quizHook.currentScreen === "start" && <StartScreen {...quizHook} />}
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