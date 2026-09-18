import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AlertCircle, Clock, Timer } from "lucide-react";
import { useEffect } from "react";
import { useQuestionTimer } from "../lib/useQuestionTimer";
import { playTimerAlert } from "../lib/timerSound";

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

type TimerState = "idle" | "running" | "warning" | "expired" | "answered";

type QuestionTimerProps = {
  durationSeconds: number;
  disabled?: boolean;
  autoStart?: boolean;
  onExpire: () => void;
};

export function QuestionTimer({
  durationSeconds,
  disabled = false,
  autoStart = false,
  onExpire,
}: QuestionTimerProps) {
  const enabled = !disabled;

  const { isRunning, remainingSeconds, isExpired, start } = useQuestionTimer({
    durationSeconds,
    enabled,
    onExpire,
  });

  // Som ao expirar (separado do hook para não duplicar)
  useEffect(() => {
    if (isExpired && !disabled) {
      playTimerAlert();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired]);

  // Iniciar automaticamente
  useEffect(() => {
    if (autoStart && enabled && !isRunning && !isExpired) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, enabled]);

  const timerState: TimerState = disabled
    ? "answered"
    : isExpired
      ? "expired"
      : isRunning && remainingSeconds <= 10
        ? "warning"
        : isRunning
          ? "running"
          : "idle";

  const containerClasses = cn(
    "flex items-center justify-between rounded-lg px-4 py-3 transition-colors",
    timerState === "idle" && "bg-muted",
    timerState === "running" && "bg-muted",
    timerState === "warning" && "bg-destructive/10 border border-destructive/30",
    timerState === "expired" && "bg-destructive/10 border border-destructive/30",
    timerState === "answered" && "bg-muted opacity-60",
  );

  const timeClasses = cn(
    "text-2xl font-bold tabular-nums transition-colors",
    timerState === "warning" && "text-destructive",
    timerState === "expired" && "text-destructive",
    timerState === "running" && "text-foreground",
    (timerState === "idle" || timerState === "answered") && "text-muted-foreground",
  );

  const buttonLabel = (() => {
    if (timerState === "answered") return "Respondido";
    if (timerState === "expired") return "Tempo esgotado";
    if (timerState === "running" || timerState === "warning") return "Em andamento";
    return "Iniciar tempo";
  })();

  const TimerIcon =
    timerState === "expired" || timerState === "warning"
      ? AlertCircle
      : timerState === "running"
        ? Timer
        : Clock;

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-3">
        <TimerIcon
          className={cn(
            "h-5 w-5 shrink-0",
            timerState === "warning" || timerState === "expired"
              ? "text-destructive"
              : "text-muted-foreground",
          )}
          aria-hidden
        />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {timerState === "expired" ? "Tempo esgotado" : "Tempo da questão"}
          </p>
          <p
            className={timeClasses}
            aria-live="polite"
            aria-label={`Tempo restante: ${formatTime(remainingSeconds)}`}
          >
            {formatTime(remainingSeconds)}
          </p>
        </div>
      </div>

      {timerState !== "answered" && (
        <Button
          variant={timerState === "idle" ? "default" : "outline"}
          size="sm"
          onClick={start}
          disabled={timerState !== "idle"}
          aria-label={buttonLabel}
        >
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
