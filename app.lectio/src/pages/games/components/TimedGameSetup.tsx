import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock, Play, Zap } from "lucide-react";
import { useState } from "react";
import type { GameType } from "../lib/gameTypes";
import { GameRulesHelp } from "./GameRulesHelp";
import { TimeWheelPicker } from "./TimeWheelPicker";

type TimedGameSetupProps = {
  gameName: string;
  gameType?: GameType;
  onStart: (durationSeconds: number, autoStart: boolean) => void;
  initialTimeLimitSeconds?: number;
  initialAutoStart?: boolean;
};

export function TimedGameSetup({
  gameName,
  gameType,
  onStart,
  initialTimeLimitSeconds,
  initialAutoStart = false,
}: TimedGameSetupProps) {
  const initialMinutes = initialTimeLimitSeconds
    ? Math.min(5, Math.floor(initialTimeLimitSeconds / 60))
    : 1;
  const initialSeconds = initialTimeLimitSeconds
    ? initialMinutes >= 5
      ? 0
      : initialTimeLimitSeconds % 60
    : 30;

  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [autoStart, setAutoStart] = useState(initialAutoStart);

  const durationSeconds = Math.min(
    300,
    minutes * 60 + (minutes >= 5 ? 0 : seconds),
  );
  const canStart = durationSeconds > 0;

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-8 md:px-6 flex items-start justify-center">
      <Card className="mx-auto w-full max-w-lg overflow-hidden border-primary/20 shadow-xl shadow-primary/5">
        <CardHeader className="border-b bg-muted/30 p-6 md:p-8 space-y-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Configuração da partida
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {gameName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Deslize o temporizador para definir o tempo por questão antes de
            começar (máx. 5 minutos).
          </p>
        </CardHeader>

        <CardContent className="space-y-6 p-6 md:p-8">
          {/* Regras e explicação do tipo de jogo */}
          {gameType && <GameRulesHelp type={gameType} defaultOpen={false} />}

          {/* Drum Picker iOS Style */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Tempo por questão
              </span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {formattedTime}
              </span>
            </div>

            <TimeWheelPicker
              minutes={minutes}
              seconds={seconds}
              onMinutesChange={setMinutes}
              onSecondsChange={setSeconds}
            />
          </div>

          {/* Resumo visual */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
              canStart
                ? "border-primary/20 bg-primary/5"
                : "border-destructive/20 bg-destructive/5",
            )}
          >
            <Clock
              className={cn(
                "h-5 w-5 shrink-0",
                canStart ? "text-primary" : "text-destructive",
              )}
            />
            <p className="text-sm">
              {canStart ? (
                <>
                  Cada questão terá limite de{" "}
                  <strong className="font-semibold text-foreground">
                    {formattedTime}
                  </strong>{" "}
                  ({durationSeconds} segundos).
                </>
              ) : (
                <span className="text-destructive font-medium">
                  Defina um tempo maior que zero para iniciar.
                </span>
              )}
            </p>
          </div>

          {/* Opção de início automático */}
          <label
            htmlFor="auto-start"
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors",
              autoStart
                ? "border-primary/30 bg-primary/5"
                : "hover:bg-muted/50 border-border/60",
            )}
          >
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                id="auto-start"
                type="checkbox"
                checked={autoStart}
                onChange={(event) => setAutoStart(event.target.checked)}
                className="h-4 w-4 accent-primary rounded cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Zap
                  className={cn(
                    "h-4 w-4",
                    autoStart ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className="font-medium text-foreground">
                  Iniciar automaticamente
                </span>
              </div>
              <span className="mt-1 block text-xs text-muted-foreground leading-relaxed">
                {autoStart
                  ? "O cronômetro inicia sozinho logo após você carregar cada questão."
                  : 'Você precisará clicar no botão "Iniciar tempo" ao ver a questão.'}
              </span>
            </div>
          </label>

          {/* Botão Iniciar */}
          <Button
            className="w-full font-semibold gap-2"
            size="lg"
            onClick={() => onStart(durationSeconds, autoStart)}
            disabled={!canStart}
          >
            <Play className="h-4 w-4 fill-current" />
            Iniciar jogo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
