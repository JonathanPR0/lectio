// src/pages/Statistics.tsx
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Calendar,
  Flame,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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
import { useProfile } from "@/hooks/useProfile";
import { useQuestions } from "@/hooks/useQuestions";
import { useAnswersStore, type AnswerResponse } from "@/store/answersStore";
import { Progress } from "@radix-ui/react-progress";

const MAX_SHIELDS = 2;

export function Statistics() {
  const navigate = useNavigate();
  const { profile, isLoading, purchaseShield, isPurchasing } = useProfile();
  const { getProgress } = useQuestions();
  const { addAnswer, setDailyQuestion } = useAnswersStore();

  const questionProgress = getProgress();

  // Redirecionamento se não tiver respondido nenhuma pergunta
  useEffect(() => {
    if (!isLoading && questionProgress === 0) {
      navigate("/");
    }
  }, [isLoading, questionProgress, navigate]);

  // Formata a data de última atividade
  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  // Handler para compra de escudos
  const handlePurchaseShield = () => {
    if (!profile) return;
    purchaseShield();
  };

  const isFullOfShields = useMemo(
    () => (profile ? profile.shields >= MAX_SHIELDS : false),
    [profile],
  );

  useEffect(() => {
    document.title = "Estatísticas | Lectio";
    if (profile?.lastAnswers) {
      // Set the daily question ID from the first answer
      const firstAnswer = profile.lastAnswers[0];
      if (firstAnswer) {
        setDailyQuestion(firstAnswer.dailyQuestionsId);
      }

      // Convert and store each answer
      profile.lastAnswers.forEach((lastAnswer) => {
        const answerResponse: AnswerResponse = {
          questionId: lastAnswer.questionId,
          answerIndex: lastAnswer.userAnswerIndex, // Using userAnswerIndex as answerIndex
          correctOptionIndex: lastAnswer.answerIndex, // Using answerIndex as correctOptionIndex
          answer: lastAnswer.answer,
          isCorrect: lastAnswer.answerIndex === lastAnswer.userAnswerIndex, // Compare indexes to determine if correct
        };

        addAnswer(answerResponse);
      });
    }
  }, [profile?.lastAnswers, addAnswer, setDailyQuestion]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <MotionSpinner className="h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-foreground">Carregando suas estatísticas...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Perfil não encontrado</CardTitle>
            <CardDescription>
              Não foi possível carregar suas estatísticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Parece que houve um problema ao buscar seu perfil. Por favor,
              tente novamente.
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

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Estatísticas</h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e conquistas no Lection
        </p>
      </div>

      {/* Perfil do usuário */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{profile.username}</CardTitle>
            <CardDescription>
              Membro desde{" "}
              {format(new Date(profile.createdAt), "PP", { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                <Award className="h-8 w-8 text-amber-500 mb-2" />
                <span className="text-2xl font-bold">{profile.points}</span>
                <span className="text-sm text-muted-foreground">Pontos</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                {profile.shields === 0 && (
                  <ShieldAlert className="h-8 w-8 text-primary mb-2" />
                )}
                {profile.shields === 1 && (
                  <Shield className="h-8 w-8 text-primary mb-2" />
                )}
                {isFullOfShields && (
                  <ShieldCheck className="h-8 w-8 text-primary mb-2" />
                )}
                <span className="text-2xl font-bold">{profile.shields}</span>
                <span className="text-sm text-muted-foreground">Escudos</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                <Flame className="h-8 w-8 text-orange-500 mb-2" />
                <span className="text-2xl font-bold">
                  {profile.streakCount}
                </span>
                <span className="text-sm text-muted-foreground">
                  Dias de ofensiva
                </span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
              <Calendar className="h-4 w-4" />
              <span>
                Último quiz realizado:{" "}
                {formatLastActivity(profile.lastActivityDate)}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progresso do quiz de hoje */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quiz de hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questionProgress === 100 ? (
              <div className="text-center p-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-xl mb-2">Quiz Concluído!</h3>
                <p className="text-muted-foreground mb-4">
                  Você já completou todas as questões de hoje. Volte amanhã para
                  mais desafios!
                </p>
                <Button
                  onClick={() => navigate("/questions?showResults")}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Ver minhas respostas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Progresso</span>
                      <span className="font-medium">
                        {Number(questionProgress).toFixed(2)}%
                      </span>
                    </div>
                    <Progress value={questionProgress} className="h-2" />
                  </div>

                  <p className="text-muted-foreground text-sm">
                    {questionProgress > 0
                      ? `Você já respondeu algumas questões hoje, mas ainda não terminou o quiz.`
                      : `Você ainda não começou o quiz de hoje.`}
                  </p>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => navigate("/questions")}
                    className="w-full"
                  >
                    {questionProgress > 0 ? "Continuar quiz" : "Começar quiz"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Comprar escudo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Comprar escudo</CardTitle>
            <CardDescription>
              Escudos te protegem quando você perde um dia da sua ofensiva
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/50 rounded-lg gap-2">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium text-center sm:text-left">
                    Escudo da Fé
                  </h3>
                  <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Mantém sua ofensiva intacta quando você perde um dia
                  </p>
                </div>
              </div>
              <div className="text-primary font-bold text-nowrap">
                {isFullOfShields ? "(Máximo)" : "100 pontos"}
              </div>
            </div>

            {profile.points < 100 && !isFullOfShields && (
              <div className="flex items-center gap-2 bg-destructive/20 p-3 rounded-md text-sm">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span>
                  Você precisa de mais {100 - profile.points} pontos para
                  comprar um escudo
                </span>
              </div>
            )}
          </CardContent>
          {profile.points >= 100 && !isFullOfShields && (
            <CardFooter>
              <Button
                onClick={handlePurchaseShield}
                className="w-full"
                disabled={profile.points < 100 || isPurchasing}
              >
                {isPurchasing ? (
                  <>
                    <MotionSpinner />
                    Comprando...
                  </>
                ) : (
                  "Comprar escudo"
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </motion.div>

      {/* Estatísticas adicionais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className="text-xl font-semibold">
          Dicas para aumentar sua pontuação
        </h2>
        <Card>
          <CardContent className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="currentColor"
                    viewBox="0 0 6 6"
                  >
                    <circle cx="3" cy="3" r="3" />
                  </svg>
                </div>
                <span>
                  Complete o quiz todos os dias para manter sua ofensiva
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="currentColor"
                    viewBox="0 0 6 6"
                  >
                    <circle cx="3" cy="3" r="3" />
                  </svg>
                </div>
                <span>Responda corretamente para ganhar mais pontos</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="currentColor"
                    viewBox="0 0 6 6"
                  >
                    <circle cx="3" cy="3" r="3" />
                  </svg>
                </div>
                <span>Questões difíceis oferecem mais pontos</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="currentColor"
                    viewBox="0 0 6 6"
                  >
                    <circle cx="3" cy="3" r="3" />
                  </svg>
                </div>
                <span>
                  Use escudos para proteger sua ofensiva em dias que não
                  conseguir completar o quiz
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
