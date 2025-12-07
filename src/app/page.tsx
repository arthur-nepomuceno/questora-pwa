"use client";
import { useQuiz } from "@/hooks/useQuiz";
import ModalidadeScreen from "@/components/ModalidadeScreen";
import CategoryScreen from "@/components/CategoryScreen";
import ComingSoonScreen from "@/components/ComingSoonScreen";
import CreditsScreen from "@/components/CreditsScreen";
import PurchaseCreditsScreen from "@/components/PurchaseCreditsScreen";
import OptionsScreen from "@/components/OptionsScreen";
import QuizScreen from "@/components/QuizScreen";
import ResultsScreen from "@/components/ResultsScreen";
import ReviewScreen from "@/components/ReviewScreen";
import CalculationsScreen from "@/components/CalculationsScreen";
import AuthScreen from "@/components/AuthScreen";
import InstallPrompt from "@/components/InstallPrompt";
import RankingScreen from "@/components/RankingScreen";
import PremiosScreen from "@/components/PremiosScreen";
import ModalLivreInfo from "@/components/ModalLivreInfo";
import ConsentModal from "@/components/ConsentModal";

export default function Home() {
  const quizHook = useQuiz();

  return (
    <div className="quiz-container">
      {quizHook.currentScreen === "modalidade" && <ModalidadeScreen selectModalidade={quizHook.selectModalidade} goToOptions={quizHook.goToOptions} setScreen={quizHook.setScreen} selectedModalidade={quizHook.selectedModalidade} />}
      {quizHook.currentScreen === "auth" && (
        <AuthScreen 
          onAuthSuccess={quizHook.goToCompetition}
          onBack={quizHook.goBackToModalidade}
        />
      )}
      {quizHook.currentScreen === "start" && <CategoryScreen startQuiz={quizHook.startQuiz} setScreen={quizHook.setScreen} goBackToModalidade={quizHook.goBackToModalidade} goToOptions={quizHook.goToOptions} selectedModalidade={quizHook.selectedModalidade} />}
      {quizHook.currentScreen === "coming-soon" && (
        <ComingSoonScreen 
          modalidade={quizHook.selectedModalidade || ""} 
          goBack={quizHook.goBackToModalidade} 
        />
      )}
      {quizHook.currentScreen === "credits" && <CreditsScreen {...quizHook} />}
      {quizHook.currentScreen === "purchase-credits" && <PurchaseCreditsScreen {...quizHook} />}
      {quizHook.currentScreen === "options" && <OptionsScreen {...quizHook} />}
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
      {quizHook.currentScreen === "calculations" && <CalculationsScreen setScreen={quizHook.setScreen} />}
      {quizHook.currentScreen === "ranking" && <RankingScreen setScreen={quizHook.setScreen} />}
      {quizHook.currentScreen === "premios" && <PremiosScreen {...quizHook} />}
      
      {/* Modal para modalidade Livre */}
      {quizHook.showLivreModal && <ModalLivreInfo onClose={quizHook.closeLivreModal} />}
      
      {/* Modal de Consentimento */}
      {quizHook.showConsentModal && (
        <ConsentModal
          onConfirm={quizHook.handleConsentConfirm}
          onCancel={quizHook.handleConsentCancel}
        />
      )}
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}