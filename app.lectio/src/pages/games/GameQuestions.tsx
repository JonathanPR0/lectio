import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMetaTags } from "@/hooks/useMetaTags";
import { cn } from "@/lib/utils";
import { httpClient } from "@/services/httpClient";
import { useGameAnswersStore } from "@/store/gameAnswersStore";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  RefreshCw,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

interface GameOption {
  text: string;
  isAnswer: boolean;
}

interface GameQuestion {
  id: string;
  text: string;
  options?: GameOption[];
  isTrue?: boolean;
  answer: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  points?: number;
}

interface Game {
  id: string;
  name: string;
  type: "options" | "boolean";
  questions: GameQuestion[];
}

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
  const [selectedBoolean, setSelectedBoolean] = useState<boolean | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useMetaTags({
    title: game ? `${game.name} - Lectio` : "Jogo - Lectio",
    description: "Teste seus conhecimentos bíblicos",
    ogImage: "/og-default.png",
  });

  // Inicializar o jogo se ainda não foi inicializado
  useEffect(() => {
    if (game && gameId) {
      const progress = getGameProgress(gameId);
      if (!progress) {
        initializeGame(gameId, game.questions.length);
      }
    }
  }, [game, gameId, getGameProgress, initializeGame]);

  // Redirecionar se não houver jogo
  useEffect(() => {
    if (!game && !isPending && !isLoading) {
      toast.error("Jogo não encontrado");
      navigate("/games");
    }
  }, [game, navigate, isPending, isLoading]);

  if (!game || !gameId) {
    return null;
  }

  const questionOrder = getQuestionOrder(gameId);
  const currentIndex = getCurrentQuestionIndex(gameId);
  const currentQuestionIndex = questionOrder[currentIndex];
  const currentQuestion = game.questions[currentQuestionIndex];
  const gameScore = calculateGameScore(gameId);
  const progress = (gameScore.total / game.questions.length) * 100;

  // Verificar se a questão atual já foi respondida
  const currentQuestionAnswered = currentQuestion
    ? isQuestionAnswered(gameId, currentQuestion.id)
    : false;

  // Obter resposta da questão atual
  const currentAnswer = currentQuestion
    ? getQuestionAnswer(gameId, currentQuestion.id)
    : null;

  // Verificar se todas as questões foram respondidas
  const allQuestionsAnswered = gameScore.total === game.questions.length;

  // Função para enviar resposta
  const handleAnswerQuestion = () => {
    if (!currentQuestion || currentQuestionAnswered) return;

    let isCorrect = false;

    if (game.type === "options") {
      if (selectedOptionIndex === null) {
        toast.error("Selecione uma opção");
        return;
      }
      const selectedOption = currentQuestion.options?.[selectedOptionIndex];
      isCorrect = selectedOption?.isAnswer || false;

      addGameAnswer(gameId, {
        questionId: currentQuestion.id,
        answerIndex: selectedOptionIndex,
        isCorrect,
      });
    } else if (game.type === "boolean") {
      if (selectedBoolean === null) {
        toast.error("Selecione uma opção");
        return;
      }
      isCorrect = selectedBoolean === currentQuestion.isTrue;

      addGameAnswer(gameId, {
        questionId: currentQuestion.id,
        answerBoolean: selectedBoolean,
        isCorrect,
      });
    }

    // Reset selection state after answering
    setSelectedOptionIndex(null);
    setSelectedBoolean(null);
  };

  // Função para ir para próxima questão
  const handleNextQuestion = () => {
    if (currentIndex < game.questions.length - 1) {
      goToNextQuestion(gameId);
      setSelectedOptionIndex(null);
      setSelectedBoolean(null);
    }
  };

  // Função para ir para questão anterior
  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      goToPreviousQuestion(gameId);
      setSelectedOptionIndex(null);
      setSelectedBoolean(null);
    }
  };

  // Função para entrar no modo de revisão
  const enterReviewMode = () => {
    setReviewMode(true);
  };

  // Função para reiniciar o jogo
  const handleResetGame = () => {
    resetGame(gameId);
    setReviewMode(false);
    setSelectedOptionIndex(null);
    setSelectedBoolean(null);
  };

  // Função para reiniciar o jogo com confirmação
  const handleResetGameWithConfirmation = () => {
    if (
      window.confirm(
        "Tem certeza que deseja reiniciar o jogo? Todo o progresso será perdido.",
      )
    ) {
      handleResetGame();
      toast.success("Jogo reiniciado!");
    }
  };

  // Tela de conclusão quando todas as questões forem respondidas
  if (allQuestionsAnswered && !reviewMode) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center bg-background p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-primary/20">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Parabéns!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-muted-foreground">
                Você completou o jogo "{game.name}"
              </p>

              <div className="mb-6 rounded-lg bg-muted p-4">
                <div className="mb-2">
                  <span className="text-3xl font-bold text-primary">
                    {gameScore.correct}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    / {gameScore.total}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Respostas corretas
                </p>
                <div className="mt-2 text-2xl font-semibold text-primary">
                  {Math.round((gameScore.correct / gameScore.total) * 100)}%
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                onClick={enterReviewMode}
                className="w-full"
                variant="outline"
              >
                Revisar respostas
              </Button>
              <Button
                onClick={handleResetGame}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Jogar novamente
              </Button>
              <Button onClick={() => navigate("/games")} className="w-full">
                Voltar para jogos
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center bg-background p-4 md:p-6 gap-4">
      {/* Header */}
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <div
            className="flex gap-2 items-center text-sm cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate("/games")}
          >
            <ChevronLeft className="h-4 w-4" /> Voltar para jogos
          </div>

          {/* Botão de reset */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetGameWithConfirmation}
            className="text-muted-foreground hover:text-destructive px-0"
            title="Reiniciar jogo"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
        </div>

        {reviewMode && (
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Revisando respostas</h2>
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-foreground">{game.name}</h1>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {game.questions.length}
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-muted rounded-full h-2.5 mb-6">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Contador de questões e dificuldade */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            Questão {currentIndex + 1} de {game.questions.length}
          </div>
          {currentQuestion?.difficulty && (
            <div className="text-sm font-medium text-primary">
              {currentQuestion.difficulty === "EASY" && "Fácil"}
              {currentQuestion.difficulty === "MEDIUM" && "Médio"}
              {currentQuestion.difficulty === "HARD" && "Difícil"}
            </div>
          )}
        </div>
      </div>

      {/* Cartão da questão */}
      <motion.div
        key={currentQuestion?.id || "question"}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-primary/20">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <CardTitle className="text-lg md:text-xl flex-1">
                {currentQuestion?.text}
              </CardTitle>
            </div>
            {currentQuestion?.points && (
              <p className="text-sm text-muted-foreground">
                Vale {currentQuestion.points} pontos
              </p>
            )}
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            {game.type === "options" ? (
              <div className="flex flex-col space-y-2 md:space-y-3">
                {currentQuestion?.options?.map((option, index) => {
                  const isSelected = selectedOptionIndex === index;
                  const isAnswered = currentQuestionAnswered;
                  const isCorrectOption = option.isAnswer;
                  const wasSelected =
                    isAnswered && currentAnswer?.answerIndex === index;

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className={cn(
                        "w-full h-auto min-h-[3rem] py-3 px-4 text-left justify-start whitespace-normal",
                        isSelected &&
                          !isAnswered &&
                          "border-primary bg-primary/5",
                        isAnswered &&
                          isCorrectOption &&
                          "border-green-500 bg-green-50 dark:bg-green-950",
                        isAnswered &&
                          wasSelected &&
                          !isCorrectOption &&
                          "border-red-500 bg-red-50 dark:bg-red-950",
                      )}
                      onClick={() => {
                        if (!isAnswered) {
                          setSelectedOptionIndex(index);
                        }
                      }}
                      disabled={isAnswered}
                    >
                      <span className="flex-1">{option.text}</span>
                      {isAnswered && isCorrectOption && (
                        <CheckCircle2 className="ml-2 h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                      {isAnswered && wasSelected && !isCorrectOption && (
                        <XCircle className="ml-2 h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col space-y-2 md:space-y-3">
                {[true, false].map((value) => {
                  const isSelected = selectedBoolean === value;
                  const isAnswered = currentQuestionAnswered;
                  const isCorrectOption = value === currentQuestion?.isTrue;
                  const wasSelected =
                    isAnswered && currentAnswer?.answerBoolean === value;

                  return (
                    <Button
                      key={value.toString()}
                      variant="outline"
                      className={cn(
                        "w-full h-auto min-h-[3rem] py-3 px-4 text-left justify-start",
                        isSelected &&
                          !isAnswered &&
                          "border-primary bg-primary/5",
                        isAnswered &&
                          isCorrectOption &&
                          "border-green-500 bg-green-50 dark:bg-green-950",
                        isAnswered &&
                          wasSelected &&
                          !isCorrectOption &&
                          "border-red-500 bg-red-50 dark:bg-red-950",
                      )}
                      onClick={() => {
                        if (!isAnswered) {
                          setSelectedBoolean(value);
                        }
                      }}
                      disabled={isAnswered}
                    >
                      <span className="flex-1">
                        {value ? "Verdadeiro" : "Falso"}
                      </span>
                      {isAnswered && isCorrectOption && (
                        <CheckCircle2 className="ml-2 h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                      {isAnswered && wasSelected && !isCorrectOption && (
                        <XCircle className="ml-2 h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Resposta explicativa */}
            {currentQuestionAnswered && currentAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <Separator className="mb-4" />
                <div
                  className={cn(
                    "rounded-lg p-4",
                    currentAnswer.isCorrect
                      ? "bg-green-50 dark:bg-green-950"
                      : "bg-red-50 dark:bg-red-950",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {currentAnswer.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold mb-1">
                        {currentAnswer.isCorrect
                          ? "Resposta correta!"
                          : "Resposta incorreta"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentQuestion.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between gap-2 p-4 md:p-6 pt-0 md:pt-0">
            {currentIndex > 0 && (
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                className="flex-1"
              >
                Anterior
              </Button>
            )}

            {currentQuestionAnswered ? (
              currentIndex < game.questions.length - 1 ? (
                <Button onClick={handleNextQuestion} className="flex-1">
                  Próxima
                </Button>
              ) : (
                <Button onClick={() => setReviewMode(false)} className="flex-1">
                  Ver resultados
                </Button>
              )
            ) : (
              <Button
                onClick={handleAnswerQuestion}
                disabled={
                  (game.type === "options" && selectedOptionIndex === null) ||
                  (game.type === "boolean" && selectedBoolean === null)
                }
                className="flex-1"
              >
                Responder
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
