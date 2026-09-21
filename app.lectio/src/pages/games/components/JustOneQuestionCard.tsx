import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Lightbulb,
  Shuffle,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { CategoryAnswerGameQuestion } from "../lib/gameTypes";
import { GameRulesHelp } from "./GameRulesHelp";

type JustOneQuestionCardProps = {
  question: CategoryAnswerGameQuestion;
  currentRound: number;
  isLastQuestion: boolean;
  remainingReserveCount?: number;
  answered: boolean;
  isCorrect?: boolean;
  onSwapQuestion?: () => void;
  onSubmitAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function JustOneQuestionCard({
  question,
  currentRound,
  isLastQuestion,
  remainingReserveCount = 0,
  answered,
  isCorrect,
  onSwapQuestion,
  onSubmitAnswer,
  onNext,
  onPrevious,
}: JustOneQuestionCardProps) {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto space-y-3"
    >
      <Card className="overflow-hidden border-chart-3/20 shadow-lg shadow-chart-3/5">
        {/* Header: Categoria da palavra */}
        <CardHeader className="border-b bg-muted/20 p-5 md:p-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-chart-3">
            Categoria da Palavra
          </p>
          <p className="whitespace-pre-line text-2xl font-bold leading-8 text-foreground md:text-3xl tracking-tight">
            {question.category}
          </p>
        </CardHeader>

        <CardContent className="p-5 md:p-7 space-y-5">
          {/* Regras do Jogo */}
          <GameRulesHelp type="just_one" />

          {/* ── Cartões de Papéis ───────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Cartão 1: Adivinhador */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col justify-between gap-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-primary/40 bg-primary/10 text-primary gap-1 font-bold text-xs"
                  >
                    <User className="h-3.5 w-3.5" />
                    Adivinhador da Vez
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Adivinhar:{" "}
                  <span className="text-primary font-bold">
                    {question.category}
                  </span>
                </p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-background/80 p-2.5 mt-1 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Não olhe as pistas até que todos os colegas tenham escrito!
                </p>
              </div>
            </div>

            {/* Cartão 2: Pistas (Palavra Secreta) */}
            <div className="rounded-xl border border-chart-3/40 bg-chart-3/5 p-4 flex flex-col justify-between min-h-[160px]">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <Badge
                    variant="outline"
                    className="border-chart-3/40 bg-chart-3/20 text-chart-3 gap-1 font-bold text-xs"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Pista
                  </Badge>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAnswerRevealed((prev) => !prev)}
                    className="h-7 gap-1 text-xs font-bold text-chart-3 hover:text-chart-3 hover:bg-chart-3/15 px-2"
                  >
                    {isAnswerRevealed ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        Revelar
                      </>
                    )}
                  </Button>
                </div>

                {isAnswerRevealed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-2.5"
                  >
                    <div className="rounded-lg border border-chart-3/30 bg-chart-3/10 p-3 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                        Palavra Secreta
                      </span>
                      <p className="text-xl md:text-2xl font-black text-chart-3 uppercase tracking-wide">
                        {question.answer}
                      </p>
                    </div>

                    {onSwapQuestion && !answered && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onSwapQuestion}
                        className="w-full gap-1.5 text-xs font-bold h-8 rounded-lg border-chart-3/40 bg-chart-3/10 text-chart-3 hover:bg-chart-3/20 transition-all shadow-xs"
                        title="Sortear outra palavra caso esta seja muito difícil"
                      >
                        <Shuffle className="h-3.5 w-3.5" />
                        Palavra difícil? Trocar
                        {remainingReserveCount > 0 && (
                          <span className="opacity-80 font-normal">
                            ({remainingReserveCount})
                          </span>
                        )}
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <div
                    onClick={() => setIsAnswerRevealed(true)}
                    className="cursor-pointer rounded-lg border border-dashed border-chart-3/40 bg-chart-3/10 p-4 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-chart-3/15 transition-all"
                    role="button"
                    tabIndex={0}
                  >
                    <Eye className="h-5 w-5 text-chart-3" />
                    <span className="text-xs font-bold text-chart-3">
                      Toque para ver a palavra secreta
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      (Apenas para quem dará as pistas)
                    </span>
                  </div>
                )}
              </div>

              {isAnswerRevealed && (
                <div className="rounded-lg border border-chart-3/20 bg-background/80 p-2 mt-2.5 flex items-start gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-chart-3 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Escrevam 1 pista cada. Anulem as repetidas antes de mostrar!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Avaliação da Rodada ───────────────────────────────── */}
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              O adivinhador acertou a palavra secreta?
            </p>

            {!answered ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onSubmitAnswer(true)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 font-semibold",
                    "border-success/30 bg-success/5 text-success/70 dark:text-success/80",
                    "transition-all hover:border-success/60 hover:bg-success/15 active:scale-[0.97]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2",
                  )}
                >
                  <ThumbsUp className="h-7 w-7" />
                  <span>Acertou</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSubmitAnswer(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 font-semibold",
                    "border-destructive/30 bg-destructive/5 text-destructive/80",
                    "transition-all hover:border-destructive/60 hover:bg-destructive/15 active:scale-[0.97]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
                  )}
                >
                  <ThumbsDown className="h-7 w-7" />
                  <span>Errou</span>
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4",
                  isCorrect
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-destructive/30 bg-destructive/10 text-destructive",
                )}
              >
                <div className="flex items-center gap-2.5">
                  {isCorrect ? (
                    <ThumbsUp className="h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <ThumbsDown className="h-5 w-5 shrink-0 text-destructive" />
                  )}
                  <span className="text-sm font-bold">
                    {isCorrect ? "Marcado como acerto!" : "Marcado como erro!"}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSubmitAnswer(!isCorrect)}
                  className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                >
                  Alterar
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>

        {/* Footer: navegação e ação principal padronizada */}
        <CardFooter className="border-t bg-muted/10 flex items-center justify-between gap-2 p-4 md:p-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={currentRound <= 1}
            aria-label="Rodada anterior"
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex-1 flex justify-end">
            {answered && (
              <Button
                onClick={onNext}
                size="sm"
                className="gap-1.5 px-5 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLastQuestion ? (
                  <>
                    <Trophy className="h-4 w-4" />
                    Ver resultados
                  </>
                ) : (
                  <>
                    Próxima rodada
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
