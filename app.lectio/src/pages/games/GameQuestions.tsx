import AlertPopUp from "@/components/custom/AlertPopUp";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMetaTags } from "@/hooks/useMetaTags";
import { httpClient } from "@/services/httpClient";
import { useGameAnswersStore } from "@/store/gameAnswersStore";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { GameCompletion } from "./components/GameCompletion";
import { GameQuestionCard } from "./components/GameQuestionCard";
import { ItoGameSetup } from "./components/ItoGameSetup";
import { ItoQuestionCard } from "./components/ItoQuestionCard";
import { TimedGameSetup } from "./components/TimedGameSetup";
import {
  difficultyPoints,
  getDifficultyColor,
  getDifficultyLabel,
} from "./lib/gameConfig";
import type { Game, ItoGameQuestion } from "./lib/gameTypes";
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
    calculateGroupScores,
    goToNextQuestion,
    goToPreviousQuestion,
    resetGame,
    setItoConfig,
    getOrGenerateItoRoundNumbers,
  } = useGameAnswersStore();

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [reviewMode, setReviewMode] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeConfigured, setTimeConfigured] = useState(false);
  // Ito: configurado quando o setup foi finalizado
  const [itoConfigured, setItoConfigured] = useState(false);

  const isIto = game?.type === "ito";

  const gameProgress = gameId ? getGameProgress(gameId) : undefined;
  const timePreferences = gameId ? getGameTimePreferences(gameId) : undefined;
  const questionOrder = gameId ? getQuestionOrder(gameId) : [];
  const currentIndex = gameId ? getCurrentQuestionIndex(gameId) : 0;
  const currentQuestionIndex = questionOrder[currentIndex];
  const currentQuestion = game?.questions ? game.questions[currentQuestionIndex] : undefined;
  const itoPlayerCount = gameProgress?.itoPlayerCount ?? 3;

  const playerNumbers = useMemo(() => {
    if (!isIto || !gameId || !currentQuestion?.id) return [];
    return getOrGenerateItoRoundNumbers(
      gameId,
      currentQuestion.id,
      itoPlayerCount,
    );
  }, [isIto, gameId, currentQuestion?.id, itoPlayerCount, getOrGenerateItoRoundNumbers]);

  useMetaTags({
    title: game ? `${game.name} - Lectio` : "Jogo - Lectio",
    description: "Teste seus conhecimentos bíblicos",
    ogImage: "/og-default.png",
  });

  // Inicializar o jogo
  useEffect(() => {
    if (game && gameId) {
      const progress = getGameProgress(gameId);
      // Ito: aguarda configuração do número de jogadores e tempo
      if (isIto && !itoConfigured) return;
      // Outros jogos temporizados: aguarda configuração de tempo e grupos
      if (!isIto && isTimedGameType(game.type) && !timeConfigured) return;
      if (!progress) {
        initializeGame(gameId, game.questions, 1);
      }
    }
  }, [game, gameId, getGameProgress, initializeGame, timeConfigured, itoConfigured, isIto]);

  // Redirecionar se não houver jogo
  useEffect(() => {
    if (!game && !isPending && !isLoading) {
      toast.error("Jogo não encontrado");
      navigate("/games");
    }
  }, [game, navigate, isPending, isLoading]);

  // Verificar se o Ito já foi configurado (reload da página)
  useEffect(() => {
    if (game && gameId && isIto) {
      const progress = getGameProgress(gameId);
      if (progress?.itoPlayerCount) {
        setItoConfigured(true);
      }
    }
  }, [game, gameId, isIto, getGameProgress]);

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

  // ── Tela de setup para jogos de Ito ──────────────────────────────────────
  if (isIto && !itoConfigured) {
    return (
      <ItoGameSetup
        gameName={game.name}
        initialTimeLimitSeconds={timePreferences?.timeLimitSeconds}
        initialAutoStart={timePreferences?.autoStartTimer}
        onStart={(playerCount, durationSeconds, autoStart) => {
          if (!gameProgress) {
            initializeGame(gameId, game.questions, 1);
          }
          setItoConfig(gameId, playerCount, durationSeconds, autoStart);
          setItoConfigured(true);
        }}
      />
    );
  }

  // ── Tela de setup para jogos temporizados (não-Ito) ──────────────────────
  const requiresTimeSetup =
    !isIto && isTimedGameType(game.type) && !timeConfigured;

  if (requiresTimeSetup) {
    return (
      <TimedGameSetup
        gameName={game.name}
        gameType={game.type}
        initialTimeLimitSeconds={timePreferences?.timeLimitSeconds}
        initialAutoStart={timePreferences?.autoStartTimer}
        initialGroupCount={gameProgress?.groupCount ?? 1}
        onStart={(durationSeconds, autoStartTimer, groupCount) => {
          // Reinicializa com a distribuição de grupos equilibrada
          resetGame(gameId);
          initializeGame(gameId, game.questions, groupCount);
          setGameTimeLimit(gameId, durationSeconds, autoStartTimer, groupCount);
          setTimeConfigured(true);
        }}
      />
    );
  }

  const effectiveTotal = questionOrder.length > 0 ? questionOrder.length : game.questions.length;
  const gameScore = calculateGameScore(gameId);
  const answeredCount = gameScore.total;
  const progressPercent = (answeredCount / effectiveTotal) * 100;

  const currentQuestionAnswered = currentQuestion
    ? isQuestionAnswered(gameId, currentQuestion.id)
    : false;

  const currentAnswer = currentQuestion
    ? getQuestionAnswer(gameId, currentQuestion.id)
    : null;

  // ── Completado ────────────────────────────────────────────────────────────
  const allQuestionsAnswered = gameScore.total === effectiveTotal;
  const isGameCompleted =
    (isFinished || (allQuestionsAnswered && effectiveTotal > 0)) && !reviewMode;

  const handleLeaveGame = () => {
    resetGame(gameId);
    setIsFinished(false);
    navigate("/games");
  };

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
    if (currentIndex < effectiveTotal - 1) {
      goToNextQuestion(gameId);
      setSelectedOptionIndex(null);
    } else {
      if (isIto) {
        if (!currentQuestionAnswered && currentQuestion) {
          addGameAnswer(gameId, {
            questionId: currentQuestion.id,
            points: 0,
            isCorrect: true,
          });
        }
      }
      setIsFinished(true);
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
    setIsFinished(false);
    if (isIto) {
      setItoConfigured(false);
    } else if (isTimedGameType(game.type)) {
      setTimeConfigured(false);
    }
  };

  // Tela de conclusão
  if (isGameCompleted) {
    const groupScores = calculateGroupScores(gameId, game.questions);
    return (
      <GameCompletion
        gameName={game.name}
        gameType={game.type}
        totalQuestions={effectiveTotal}
        score={gameScore}
        groupScores={groupScores.length > 1 ? groupScores : undefined}
        onReview={isIto ? undefined : enterReviewMode}
        onReset={handleResetGame}
        onBack={handleLeaveGame}
      />
    );
  }

  if (!currentQuestion) {
    return null;
  }

  // ── Render Ito ────────────────────────────────────────────────────────────
  if (isIto) {
    const itoQuestion = currentQuestion as ItoGameQuestion;
    return (
      <div className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-5 md:px-6 md:py-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
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

          {/* Header */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Jogo em andamento
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {game.name}
              </h1>
            </div>
          </div>

          {/* Barra de progresso */}
          <div
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={0}
            aria-valuemax={effectiveTotal}
            aria-label={`Rodada ${currentIndex + 1} de ${effectiveTotal}`}
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{
                width: `${((currentIndex + 1) / effectiveTotal) * 100}%`,
              }}
            />
          </div>

          {/* ItoQuestionCard */}
          <ItoQuestionCard
            question={itoQuestion}
            playerCount={itoPlayerCount}
            playerNumbers={playerNumbers}
            currentQuestionIndex={currentIndex}
            totalQuestions={effectiveTotal}
            isLastQuestion={currentIndex === effectiveTotal - 1}
            timeLimitSeconds={gameProgress?.timeLimitSeconds}
            autoStartTimer={gameProgress?.autoStartTimer}
            onNext={handleNextQuestion}
            onPrevious={handlePreviousQuestion}
          />
        </div>
      </div>
    );
  }

  // ── Render jogos normais ───────────────────────────────────────────────────
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
            aria-label={`Questão ${currentIndex + 1} de ${effectiveTotal}`}
          >
            {currentIndex + 1} / {effectiveTotal}
          </span>
        </div>

        {/* Barra de progresso */}
        <div
          role="progressbar"
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={effectiveTotal}
          aria-label={`${answeredCount} de ${effectiveTotal} questões respondidas`}
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
            Questão {currentIndex + 1} de {effectiveTotal}
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
          groupCount={gameProgress?.groupCount}
          currentQuestionOrderIndex={currentIndex}
          isFirstQuestion={currentIndex === 0}
          isLastQuestion={currentIndex === effectiveTotal - 1}
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
