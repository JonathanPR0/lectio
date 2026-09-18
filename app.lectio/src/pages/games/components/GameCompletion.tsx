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
  CheckCircle2,
  ChevronLeft,
  RefreshCw,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import type { GameScore } from "../lib/gameTypes";

type GameCompletionProps = {
  gameName: string;
  score: GameScore;
  onReview: () => void;
  onReset: () => void;
  onBack: () => void;
};

function ScoreStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "text-2xl font-bold",
          highlight ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function GameCompletion({
  gameName,
  score,
  onReview,
  onReset,
  onBack,
}: GameCompletionProps) {
  const percentage = score.total
    ? Math.round((score.correct / score.total) * 100)
    : 0;

  const performanceLabel =
    percentage >= 90
      ? "Excelente!"
      : percentage >= 70
        ? "Muito bem!"
        : percentage >= 50
          ? "Bom trabalho."
          : "Continue praticando.";

  const PerformanceIcon = percentage >= 70 ? Trophy : Target;

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center bg-background p-6">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-primary/20">
          <CardHeader className="border-b bg-muted/20 p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <PerformanceIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {performanceLabel}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {gameName} concluído
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Percentual em destaque */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <span className="text-5xl font-extrabold text-primary">
                  {percentage}%
                </span>
                {percentage >= 90 && (
                  <Star className="absolute -right-6 -top-2 h-5 w-5 fill-warning/90 text-warning/90" />
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">de acerto</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 rounded-xl border bg-muted/30 p-4">
              <ScoreStat label="Corretas" value={score.correct} highlight />
              <ScoreStat label="Total" value={score.total} />
              <ScoreStat label="Pontos" value={score.points} highlight />
            </div>

            {/* Barra de acerto */}
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Aproveitamento: ${percentage}%`}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  percentage >= 70
                    ? "bg-success"
                    : percentage >= 40
                      ? "bg-warning"
                      : "bg-destructive",
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Feedback de conclusão */}
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/15 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                Você respondeu{" "}
                <strong className="text-foreground">{score.correct}</strong> de{" "}
                <strong className="text-foreground">{score.total}</strong>{" "}
                questões corretamente.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t bg-muted/10 p-5">
            <Button onClick={onReview} className="w-full" variant="outline">
              Revisar respostas
            </Button>
            <Button onClick={onReset} className="w-full" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Jogar novamente
            </Button>
            <Button onClick={onBack} className="w-full">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar para jogos
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
