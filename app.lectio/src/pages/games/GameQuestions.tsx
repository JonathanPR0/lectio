import AlertPopUp from "@/components/custom/AlertPopUp";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMetaTags } from "@/hooks/useMetaTags";
import { httpClient } from "@/services/httpClient";
import { useGameAnswersStore } from "@/store/gameAnswersStore";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { GameCompletion } from "./components/GameCompletion";
import { GameQuestionCard } from "./components/GameQuestionCard";
import { TimedGameSetup } from "./components/TimedGameSetup";
import {
  difficultyPoints,
  getDifficultyColor,
  getDifficultyLabel,
} from "./lib/gameConfig";
import type { Game } from "./lib/gameTypes";
import { isTimedGameType } from "./lib/gameTypes";

export function GameQuestions() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const {
    data: game,
    isPending,
    isLoading,
  } = useQuery<Game>({
    queryKey: ["games", gameId],
    enabled: !!gameId,
    queryFn: async () => {
      const response = await httpClient.get<Game>(`/games/${gameId}`);
      return response.data;
    },
  });

  const {
    initializeGame,
    setGameTimeLimit,
    getGameTimePreferences,
    addGameAnswer,
    getGameProgress,
    getQuestionOrder,
    getCurrentQuestionIndex,
    isQuestionAnswered,
    getQuestionAnswer,
    calculateGameScore,
    goToNextQuestion,
    goToPreviousQuestion,
    resetGame,
  } = useGameAnswersStore();

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [reviewMode, setReviewMode] = useState(false);
  const [timeConfigured, setTimeConfigured] = useState(false);

  useMetaTags({
    title: game ? `${game.name} - Lectio` : "Jogo - Lectio",
    description: "Teste seus conhecimentos bíblicos",
    ogImage: "/og-default.png",
  });

  // Inicializar o jogo se ainda não foi inicializado
  useEffect(() => {
    if (game && gameId) {
      const progress = getGameProgress(gameId);
      if (isTimedGameType(game.type) && !timeConfigured) return;
      if (!progress) {
        initializeGame(gameId, game.questions.length);
      }
    }
  }, [game, gameId, getGameProgress, initializeGame, timeConfigured]);

  // Redirecionar se não houver jogo
  useEffect(() => {
    if (!game && !isPending && !isLoading) {
      toast.error("Jogo não encontrado");
      navigate("/games");
    }
  }, [game, navigate, isPending, isLoading]);

  // Loading state
  if (isPending || isLoading) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-5 md:px-6 md:py-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-36 rounded" />
            <Skeleton className="h-7 w-20 rounded" />
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-9 w-56 rounded" />
            </div>
            <Skeleton className="h-5 w-10 rounded" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-[360px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!game || !gameId) {
    return null;
  }

  const gameProgress = getGameProgress(gameId);
  const timePreferences = getGameTimePreferences(gameId);
  const requiresTimeSetup = isTimedGameType(game.type) && !timeConfigured;

  const handleLeaveGame = () => {
    resetGame(gameId);
    navigate("/games");
  };

  if (requiresTimeSetup) {
    return (
      <TimedGameSetup
        gameName={game.name}
        initialTimeLimitSeconds={timePreferences?.timeLimitSeconds}
        initialAutoStart={timePreferences?.autoStartTimer}
        onStart={(durationSeconds, autoStartTimer) => {
          if (!gameProgress) {
            initializeGame(gameId, game.questions.length);
          }
          setGameTimeLimit(gameId, durationSeconds, autoStartTimer);
          setTimeConfigured(true);
        }}
      />
    );
  }

  const questionOrder = getQuestionOrder(gameId);
  const currentIndex = getCurrentQuestionIndex(gameId);
  const currentQuestionIndex = questionOrder[currentIndex];
  const currentQuestion = game.questions[currentQuestionIndex];
  const gameScore = calculateGameScore(gameId);
  const answeredCount = gameScore.total;
  const progressPercent = (answeredCount / game.questions.length) * 100;

  const currentQuestionAnswered = currentQuestion
    ? isQuestionAnswered(gameId, currentQuestion.id)
    : false;

  const currentAnswer = currentQuestion
    ? getQuestionAnswer(gameId, currentQuestion.id)
    : null;

  if (!currentQuestion) {
    return null;
  }

  const allQuestionsAnswered = gameScore.total === game.questions.length;

  const submitAnswer = (isCorrect: boolean) => {
    if (!currentQuestion || currentQuestionAnswered) return;

    addGameAnswer(gameId, {
      questionId: currentQuestion.id,
      answerIndex: selectedOptionIndex ?? undefined,
      points: currentQuestion.difficulty
        ? difficultyPoints[currentQuestion.difficulty]
        : 0,
      isCorrect,
    });

    setSelectedOptionIndex(null);
  };

  const handleNextQuestion = () => {
    if (currentIndex < game.questions.length - 1) {
      goToNextQuestion(gameId);
      setSelectedOptionIndex(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      goToPreviousQuestion(gameId);
      setSelectedOptionIndex(null);
    }
  };

  const enterReviewMode = () => {
    setReviewMode(true);
  };

  const handleResetGame = () => {
    resetGame(gameId);
    setReviewMode(false);
    setSelectedOptionIndex(null);
    if (isTimedGameType(game.type)) setTimeConfigured(false);
  };

  if (allQuestionsAnswered && !reviewMode) {
    return (
      <GameCompletion
        gameName={game.name}
        score={gameScore}
        onReview={enterReviewMode}
        onReset={handleResetGame}
        onBack={handleLeaveGame}
      />
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-5 md:px-6 md:py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        {/* Barra de ações */}
        <div className="flex items-center justify-between">
          <AlertPopUp
            title="Sair do jogo?"
            description="Seu progresso atual será perdido."
            action={handleLeaveGame}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para jogos
            </button>
          </AlertPopUp>

          <AlertPopUp
            title="Resetar partida?"
            description="Todo o progresso será perdido e as questões re-embaralhadas."
            action={handleResetGame}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Resetar jogo"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </button>
          </AlertPopUp>
        </div>

        {/* Cabeçalho da partida */}
        <div className="flex items-end justify-between gap-4">
          <div>
            {reviewMode && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-warning">
                Modo revisão
              </p>
            )}
            {!reviewMode && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Jogo em andamento
              </p>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {game.name}
            </h1>
          </div>
          <span
            className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground"
            aria-label={`Questão ${currentIndex + 1} de ${game.questions.length}`}
          >
            {currentIndex + 1} / {game.questions.length}
          </span>
        </div>

        {/* Barra de progresso */}
        <div
          role="progressbar"
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={game.questions.length}
          aria-label={`${answeredCount} de ${game.questions.length} questões respondidas`}
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Info da questão atual */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Questão {currentIndex + 1} de {game.questions.length}
          </span>
          {currentQuestion.difficulty && (
            <span
              className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${getDifficultyColor(currentQuestion.difficulty)}`}
            >
              {getDifficultyLabel(currentQuestion.difficulty)}
            </span>
          )}
        </div>

        {/* Card da questão */}
        <GameQuestionCard
          type={game.type}
          question={currentQuestion}
          answered={currentQuestionAnswered}
          answer={currentAnswer}
          selectedOptionIndex={selectedOptionIndex}
          timeLimitSeconds={gameProgress?.timeLimitSeconds}
          autoStartTimer={gameProgress?.autoStartTimer ?? false}
          isFirstQuestion={currentIndex === 0}
          isLastQuestion={currentIndex === game.questions.length - 1}
          onSelectOption={setSelectedOptionIndex}
          onSubmitAnswer={submitAnswer}
          onTimeExpired={() => submitAnswer(false)}
          onPrevious={handlePreviousQuestion}
          onNext={handleNextQuestion}
          onShowResults={() => setReviewMode(false)}
        />
      </div>
    </div>
  );
}
