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
import { GameScoreboardDialog } from "./components/GameScoreboardDialog";
import { ItoGameSetup } from "./components/ItoGameSetup";
import { ItoQuestionCard } from "./components/ItoQuestionCard";
import { JustOneQuestionCard } from "./components/JustOneQuestionCard";
import { SpyGameSetup } from "./components/SpyGameSetup";
import { SpyQuestionCard } from "./components/SpyQuestionCard";
import { TimedGameSetup } from "./components/TimedGameSetup";
import {
  difficultyPoints,
  getDifficultyColor,
  getDifficultyLabel,
} from "./lib/gameConfig";
import type {
  CategoryAnswerGameQuestion,
  Game,
  ItoGameQuestion,
} from "./lib/gameTypes";
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
    initializeJustOneGame,
    swapJustOneQuestion,
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
    setSpyConfig,
    getOrGenerateSpyRound,
    recordSpyRound,
  } = useGameAnswersStore();

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [reviewMode, setReviewMode] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeConfigured, setTimeConfigured] = useState(false);
  // Ito: configurado quando o setup foi finalizado
  const [itoConfigured, setItoConfigured] = useState(false);
  // Spy: configurado quando o setup de jogadores foi finalizado
  const [spyConfigured, setSpyConfigured] = useState(false);

  const isIto = game?.type === "ito";
  const isSpy = game?.type === "spy";
  const isJustOne = game?.type === "just_one";

  const gameProgress = gameId ? getGameProgress(gameId) : undefined;
  const timePreferences = gameId ? getGameTimePreferences(gameId) : undefined;
  const questionOrder = gameId ? getQuestionOrder(gameId) : [];
  const currentIndex = gameId ? getCurrentQuestionIndex(gameId) : 0;
  const currentQuestionIndex = questionOrder[currentIndex];
  const currentQuestion = game?.questions
    ? game.questions[currentQuestionIndex]
    : undefined;
  const itoPlayerCount = gameProgress?.itoPlayerCount ?? 3;
  const spyPlayerCount = gameProgress?.spyPlayerCount ?? 4;

  const playerNumbers = useMemo(() => {
    if (!isIto || !gameId || !currentQuestion?.id) return [];
    return getOrGenerateItoRoundNumbers(
      gameId,
      currentQuestion.id,
      itoPlayerCount,
    );
  }, [
    isIto,
    gameId,
    currentQuestion?.id,
    itoPlayerCount,
    getOrGenerateItoRoundNumbers,
  ]);

  const spyRound = useMemo(() => {
    if (!isSpy || !gameId || !currentQuestion?.id) return { spyIndex: 0 };
    return getOrGenerateSpyRound(gameId, currentQuestion.id, spyPlayerCount);
  }, [
    isSpy,
    gameId,
    currentQuestion?.id,
    spyPlayerCount,
    getOrGenerateSpyRound,
  ]);

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
      // Spy: aguarda configuração do número de jogadores
      if (isSpy && !spyConfigured) return;
      // Outros jogos temporizados: aguarda configuração de tempo e grupos
      if (
        !isIto &&
        !isSpy &&
        !isJustOne &&
        isTimedGameType(game.type) &&
        !timeConfigured
      )
        return;

      if (!progress) {
        if (isJustOne) {
          initializeJustOneGame(gameId, game.questions);
        } else {
          initializeGame(gameId, game.questions, 1);
        }
      }
    }
  }, [
    game,
    gameId,
    getGameProgress,
    initializeGame,
    initializeJustOneGame,
    timeConfigured,
    itoConfigured,
    spyConfigured,
    isIto,
    isSpy,
    isJustOne,
  ]);

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

  // Verificar se o Spy já foi configurado (reload da página)
  useEffect(() => {
    if (game && gameId && isSpy) {
      const progress = getGameProgress(gameId);
      if (progress?.spyPlayerCount) {
        setSpyConfigured(true);
      }
    }
  }, [game, gameId, isSpy, getGameProgress]);

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

  const handleLeaveGame = () => {
    resetGame(gameId);
    setIsFinished(false);
    navigate("/games");
  };

  // ── Tela de setup para jogos de Ito ──────────────────────────────────────
  if (isIto && !itoConfigured) {
    return (
      <ItoGameSetup
        gameName={game.name}
        onBack={handleLeaveGame}
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

  // ── Tela de setup para jogo do Espião (Spy) ──────────────────────────────
  if (isSpy && !spyConfigured) {
    return (
      <SpyGameSetup
        gameName={game.name}
        onBack={handleLeaveGame}
        initialPlayerCount={spyPlayerCount}
        onStart={(playerCount) => {
          if (!gameProgress) {
            initializeGame(gameId, game.questions, 1);
          }
          setSpyConfig(gameId, playerCount);
          setSpyConfigured(true);
        }}
      />
    );
  }

  // ── Tela de setup para jogos temporizados (não-Ito, não-Spy, não-JustOne) ───
  const requiresTimeSetup =
    !isIto &&
    !isSpy &&
    !isJustOne &&
    isTimedGameType(game.type) &&
    !timeConfigured;

  if (requiresTimeSetup) {
    return (
      <TimedGameSetup
        gameName={game.name}
        gameType={game.type}
        onBack={handleLeaveGame}
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

  const effectiveTotal =
    questionOrder.length > 0 ? questionOrder.length : game.questions.length;
  const gameScore = calculateGameScore(gameId);
  const answeredCount = gameScore.total;
  const progressPercent = (answeredCount / effectiveTotal) * 100;

  const currentQuestionAnswered = currentQuestion
    ? isQuestionAnswered(gameId, currentQuestion.id)
    : false;

  const currentAnswer = currentQuestion
    ? getQuestionAnswer(gameId, currentQuestion.id)
    : null;

  const groupScores = calculateGroupScores(gameId, game.questions);

  // ── Completado ────────────────────────────────────────────────────────────
  const allQuestionsAnswered = gameScore.total === effectiveTotal;
  const isGameCompleted =
    (isFinished || (allQuestionsAnswered && effectiveTotal > 0)) && !reviewMode;

  const submitAnswer = (isCorrect: boolean) => {
    if (!currentQuestion) return;

    addGameAnswer(gameId, {
      questionId: currentQuestion.id,
      answerIndex: selectedOptionIndex ?? undefined,
      points: currentQuestion.difficulty
        ? difficultyPoints[currentQuestion.difficulty]
        : 1,
      isCorrect,
    });

    setSelectedOptionIndex(null);
  };

  const handleVoteSpyOutcome = (winner: "spy" | "players") => {
    if (!currentQuestion) return;
    recordSpyRound(
      gameId,
      currentQuestion.id,
      spyRound.spyIndex,
      winner,
      spyPlayerCount,
    );
  };

  const handleSwapJustOneQuestion = () => {
    const newIdx = swapJustOneQuestion(
      gameId,
      currentIndex,
      game.questions.length,
    );
    if (newIdx !== null) {
      toast.success("Palavra trocada com sucesso!");
    } else {
      toast.error("Não há mais cartas disponíveis para troca.");
    }
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
    } else if (isSpy) {
      setSpyConfigured(false);
    } else if (isTimedGameType(game.type)) {
      setTimeConfigured(false);
    }
  };

  // Tela de conclusão
  if (isGameCompleted) {
    return (
      <GameCompletion
        gameName={game.name}
        gameType={game.type}
        totalQuestions={effectiveTotal}
        score={gameScore}
        groupScores={groupScores.length > 1 ? groupScores : undefined}
        spyScores={gameProgress?.spyScores}
        onReview={isIto || isSpy || isJustOne ? undefined : enterReviewMode}
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

  // ── Render Spy (Descubra o Espião) ─────────────────────────────────────────
  if (isSpy) {
    const spyQuestion =
      currentQuestion as unknown as CategoryAnswerGameQuestion;
    const currentRoundWinner =
      gameProgress?.spyRounds?.[spyQuestion.id]?.winner;

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

            <div className="flex items-center gap-2">
              <GameScoreboardDialog
                gameType={game.type}
                gameName={game.name}
                currentIndex={currentIndex}
                totalQuestions={effectiveTotal}
                score={gameScore}
                spyScores={gameProgress?.spyScores}
                spyPlayerCount={spyPlayerCount}
              />

              <AlertPopUp
                title="Resetar partida?"
                description="Todo o progresso será perdido e os espiões re-sorteados."
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
          </div>

          {/* Header */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-chart-7">
                Jogo em andamento
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {game.name}
              </h1>
            </div>
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {currentIndex + 1} / {effectiveTotal}
            </span>
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
              className="h-full rounded-full bg-chart-7 transition-all duration-500 ease-out"
              style={{
                width: `${((currentIndex + 1) / effectiveTotal) * 100}%`,
              }}
            />
          </div>

          {/* SpyQuestionCard */}
          <SpyQuestionCard
            question={spyQuestion}
            playerCount={spyPlayerCount}
            spyIndex={spyRound.spyIndex}
            currentQuestionIndex={currentIndex}
            isLastQuestion={currentIndex === effectiveTotal - 1}
            winner={currentRoundWinner}
            onVoteOutcome={handleVoteSpyOutcome}
            onNext={handleNextQuestion}
            onPrevious={handlePreviousQuestion}
          />
        </div>
      </div>
    );
  }

  // ── Render Just One (Palavra-Chave) ────────────────────────────────────────
  if (isJustOne) {
    const justOneQuestion =
      currentQuestion as unknown as CategoryAnswerGameQuestion;
    const remainingReserve = gameProgress?.justOneReserveIndices?.length ?? 0;

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

            <div className="flex items-center gap-2">
              <GameScoreboardDialog
                gameType={game.type}
                gameName={game.name}
                currentIndex={currentIndex}
                totalQuestions={effectiveTotal}
                score={gameScore}
                justOneReserveCount={remainingReserve}
              />

              <AlertPopUp
                title="Resetar partida?"
                description="Todo o progresso será perdido e as 13 cartas re-sorteadas."
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
          </div>

          {/* Header */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-chart-3">
                Jogo em andamento
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {game.name}
              </h1>
            </div>
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {currentIndex + 1} / {effectiveTotal}
            </span>
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
              className="h-full rounded-full bg-chart-3 transition-all duration-500 ease-out"
              style={{
                width: `${((currentIndex + 1) / effectiveTotal) * 100}%`,
              }}
            />
          </div>

          {/* JustOneQuestionCard */}
          <JustOneQuestionCard
            question={justOneQuestion}
            currentRound={currentIndex + 1}
            isLastQuestion={currentIndex === effectiveTotal - 1}
            remainingReserveCount={remainingReserve}
            answered={currentQuestionAnswered}
            isCorrect={currentAnswer?.isCorrect}
            onSwapQuestion={handleSwapJustOneQuestion}
            onSubmitAnswer={submitAnswer}
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

          <div className="flex items-center gap-2">
            {(groupScores.length > 1 || isTimedGameType(game.type)) && (
              <GameScoreboardDialog
                gameType={game.type}
                gameName={game.name}
                currentIndex={currentIndex}
                totalQuestions={effectiveTotal}
                score={gameScore}
                groupScores={groupScores}
              />
            )}

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
