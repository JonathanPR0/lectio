import { MotionSpinner } from "@/components/custom/MotionSpinner";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useQuestions } from "@/hooks/useQuestions";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  LogIn,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function Questions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signedIn } = useAuth();
  const {
    data,
    isLoading,
    error,
    answerQuestion,
    isAnswering,
    isQuestionAnswered,
    getQuestionAnswer,
    getCurrentScore,
    getTotalPossiblePoints,
    getProgress,
  } = useQuestions();

  const showResultsParam = searchParams.get("showResults") !== null;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [reviewMode, setReviewMode] = useState(showResultsParam);

  // Questão atual
  const currentQuestion = data?.questions?.[currentQuestionIndex];

  // Verificar se a questão atual já foi respondida
  const currentQuestionAnswered = currentQuestion
    ? isQuestionAnswered(currentQuestion.id)
    : false;

  // Obter resposta da questão atual
  const currentAnswer = currentQuestion
    ? getQuestionAnswer(currentQuestion.id)
    : null;

  // Progresso atual
  const progress = getProgress();

  // Pontuação atual
  const currentScore = getCurrentScore();
  const totalPossiblePoints = getTotalPossiblePoints();

  // Verificar se todas as questões foram respondidas
  const allQuestionsAnswered =
    data?.questions && data.questions.length > 0 && progress === 100;

  // Função para enviar a resposta
  const handleAnswerQuestion = () => {
    if (
      selectedOptionIndex === null ||
      !currentQuestion ||
      currentQuestionAnswered
    )
      return;

    const selectedOptionText = currentQuestion.options[selectedOptionIndex];

    answerQuestion(currentQuestion.id, selectedOptionText);
  };

  // Função para ir para próxima questão
  const goToNextQuestion = () => {
    if (currentQuestionIndex < (data?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      // Todas as questões foram respondidas
      toast.success("Você completou todas as questões do dia!");
    }
  };

  // Função para ir para questão anterior
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedOptionIndex(null);
    }
  };

  // Função para entrar no modo de revisão
  const enterReviewMode = () => {
    setReviewMode(true);
    setCurrentQuestionIndex(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <MotionSpinner />
          <p className="text-foreground">Carregando questões...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-500">
              Erro ao carregar questões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Não foi possível carregar as questões do dia. Por favor, tente
              novamente mais tarde.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()} className="w-full">
              Tentar novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!data || !data.questions || data.questions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Nenhuma questão disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Não há questões disponíveis para hoje. Volte amanhã para um novo
              quiz!
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar para a página inicial
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Tela de conclusão quando todas as questões forem respondidas
  if (allQuestionsAnswered && !reviewMode) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background p-6">
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
              {!signedIn && (
                <CardDescription className="mt-2">
                  Você concluiu o quiz sem estar logado
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-muted-foreground">
                Você completou todas as questões do quiz de hoje.
              </p>

              <div className="mb-6 rounded-lg bg-muted p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Sua pontuação</span>
                  <span className="font-semibold">
                    {currentScore} / {totalPossiblePoints}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${(currentScore / totalPossiblePoints) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Próximo quiz disponível amanhã</span>
              </div>

              {/* Mensagem específica para usuários não logados */}
              {!signedIn && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-4 border border-primary/20 rounded-lg bg-primary/5"
                >
                  <h4 className="font-medium text-primary mb-2">
                    Quer acompanhar seu progresso?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Faça login para ver suas estatísticas, acumular pontos e
                    manter seus dias de ofensiva!
                  </p>
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                onClick={enterReviewMode}
                className="w-full"
                variant="outline"
              >
                Revisar minhas respostas
              </Button>

              {/* Botões condicionais com base no status de login */}
              {signedIn ? (
                <Button
                  onClick={() => navigate("/")}
                  className="w-full"
                  variant="default"
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Ver minhas estatísticas
                </Button>
              ) : (
                <Button onClick={() => navigate("/sign-in")} className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Fazer login
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background p-4 md:p-6 gap-4">
      {/* Header para o modo de revisão */}
      {reviewMode && (
        <div className="w-full max-w-2xl">
          {showResultsParam ? (
            <div
              className="flex gap-2 items-center text-sm cursor-pointer mb-4 px-0 hover:bg-none"
              onClick={() => navigate("/", { replace: true })}
            >
              <ChevronLeft className="h-4 w-4" /> Voltar para a página inicial
            </div>
          ) : (
            <div
              className="flex gap-2 items-center text-sm cursor-pointer mb-4 px-0 hover:bg-none"
              onClick={() => setReviewMode(false)}
            >
              <ChevronLeft className="h-4 w-4" /> Voltar para resultados
            </div>
          )}
          <div className="mb-2 flex items-center">
            <h2 className="text-lg font-semibold">Revisando respostas</h2>
            <span className="ml-auto text-sm text-muted-foreground">
              {currentQuestionIndex + 1} de {data.questions.length}
            </span>
          </div>
        </div>
      )}

      {/* Cabeçalho normal */}
      {!reviewMode && (
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-foreground">Quiz Diário</h1>
            <p className="text-muted-foreground">
              {formatDate(new Date(data.date))}
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-muted rounded-full h-2.5 mb-6">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Contador de questões e pontuação */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Questão {currentQuestionIndex + 1} de {data.questions.length}
            </div>
            <div className="text-sm font-medium text-primary">
              {currentQuestion.difficulty === "EASY" && "Fácil"}
              {currentQuestion.difficulty === "MEDIUM" && "Médio"}
              {currentQuestion.difficulty === "HARD" && "Difícil"}
              {" • "}
              {currentQuestion.points} pontos
            </div>
          </div>

          {/* Pontuação */}
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">
              Sua pontuação: {currentScore} / {totalPossiblePoints}
            </div>
          </div>
        </div>
      )}

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
            <CardTitle className="text-lg md:text-xl">
              {currentQuestion?.text}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col space-y-2 md:space-y-3">
              {currentQuestion?.options.map((option, index) => {
                const isSelected = selectedOptionIndex === index;
                const isCorrectAnswer =
                  currentAnswer?.isCorrect &&
                  (index + 1).toString() ===
                    currentAnswer.questionId.toString();
                const isWrongAnswer =
                  currentQuestionAnswered &&
                  selectedOptionIndex === index &&
                  !currentAnswer?.isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      !currentQuestionAnswered && setSelectedOptionIndex(index)
                    }
                    className={`p-2 md:p-4 rounded-lg border transition-all ${
                      isSelected && !currentQuestionAnswered
                        ? "border-primary bg-primary/10"
                        : isCorrectAnswer
                          ? "border-green-500 bg-green-500/10"
                          : isWrongAnswer
                            ? "border-red-500 bg-red-500/10"
                            : "border-muted bg-card hover:border-primary/30"
                    } text-left`}
                    disabled={currentQuestionAnswered || reviewMode}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full aspect-square flex items-center justify-center mr-3 text-sm ${
                          isSelected && !currentQuestionAnswered
                            ? "bg-primary text-primary-foreground"
                            : isCorrectAnswer
                              ? "bg-green-500 text-white"
                              : isWrongAnswer
                                ? "bg-red-500 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-foreground">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

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
                  className={`p-4 rounded-lg ${
                    currentAnswer.isCorrect
                      ? "bg-green-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  <h3
                    className={`font-medium mb-2 ${
                      currentAnswer.isCorrect
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {currentAnswer.isCorrect
                      ? "Resposta correta!"
                      : "Resposta incorreta!"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentAnswer.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between gap-2">
            {reviewMode ? (
              <>
                {currentQuestionIndex !== 0 && (
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1"
                  >
                    Anterior
                  </Button>
                )}
                {currentQuestionIndex !== data.questions.length - 1 && (
                  <Button
                    onClick={goToNextQuestion}
                    disabled={
                      currentQuestionIndex === data.questions.length - 1
                    }
                    className="flex-1"
                  >
                    Próxima
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="w-1/4"
                >
                  Anterior
                </Button>

                {currentQuestionAnswered ? (
                  <Button
                    onClick={goToNextQuestion}
                    disabled={
                      currentQuestionIndex === data.questions.length - 1 &&
                      currentQuestionAnswered
                    }
                    className="w-2/3"
                  >
                    {currentQuestionIndex === data.questions.length - 1
                      ? "Finalizar"
                      : "Próxima questão"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleAnswerQuestion}
                    disabled={selectedOptionIndex === null || isAnswering}
                    className="w-2/3"
                  >
                    {isAnswering ? (
                      <div className="flex items-center gap-2">
                        <MotionSpinner />
                        Enviando...
                      </div>
                    ) : (
                      "Confirmar resposta"
                    )}
                  </Button>
                )}
              </>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
