import AlertPopUp from "@/components/custom/AlertPopUp";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, Minus, Play, Plus, User, Users, Zap } from "lucide-react";
import { useState } from "react";
import type { GameType } from "../lib/gameTypes";
import { PLAYER_COLORS } from "../lib/itoGameUtils";
import { GameRulesHelp } from "./GameRulesHelp";
import { TimeWheelPicker } from "./TimeWheelPicker";

type TimedGameSetupProps = {
  gameName: string;
  gameType?: GameType;
  onBack: () => void;
  onStart: (
    durationSeconds: number,
    autoStart: boolean,
    groupCount: number,
  ) => void;
  initialTimeLimitSeconds?: number;
  initialAutoStart?: boolean;
  initialGroupCount?: number;
};

export function TimedGameSetup({
  gameName,
  gameType,
  onBack,
  onStart,
  initialTimeLimitSeconds,
  initialAutoStart = false,
  initialGroupCount = 1,
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
  const [groupCount, setGroupCount] = useState(initialGroupCount);

  const durationSeconds = Math.min(
    300,
    minutes * 60 + (minutes >= 5 ? 0 : seconds),
  );
  const canStart = durationSeconds > 0;

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const MIN_GROUPS = 1;
  const MAX_GROUPS = 6;

  const decrement = () =>
    setGroupCount((n) => Math.max(MIN_GROUPS, n - 1));
  const increment = () =>
    setGroupCount((n) => Math.min(MAX_GROUPS, n + 1));

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background px-4 py-8 md:px-6 flex items-start justify-center">
      <div className="w-full max-w-lg">
        <AlertPopUp
          title="Sair do jogo?"
          description="Seu progresso atual será perdido."
          action={onBack}
        >
          <button
            type="button"
            className="mb-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para jogos
          </button>
        </AlertPopUp>

        <Card className="mx-auto w-full overflow-hidden border-primary/20 shadow-xl shadow-primary/5">
        <CardHeader className="border-b bg-muted/30 p-6 md:p-8 space-y-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Configuração da partida
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {gameName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Defina o tempo por questão e o número de pessoas ou grupos que vão
            competir.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 p-6 md:p-8">
          {/* Regras e explicação do tipo de jogo */}
          {gameType && <GameRulesHelp type={gameType} defaultOpen={false} />}

          {/* ── Seleção de Jogadores / Grupos ──────────────────────── */}
          <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {groupCount === 1 ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  <Users className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-semibold text-foreground">
                  Modo de jogo
                </span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {groupCount === 1
                  ? "Individual (1 jogador)"
                  : `${groupCount} Grupos / Pessoas`}
              </span>
            </div>

            {/* Stepper de grupos */}
            <div className="flex items-center justify-center gap-6 py-1">
              <button
                type="button"
                onClick={decrement}
                disabled={groupCount <= MIN_GROUPS}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                  groupCount <= MIN_GROUPS
                    ? "border-border/40 text-muted-foreground/40 cursor-not-allowed"
                    : "border-primary/40 text-primary hover:bg-primary/10 hover:border-primary active:scale-95",
                )}
                aria-label="Diminuir grupos"
              >
                <Minus className="h-4 w-4" />
              </button>

              <motion.div
                key={groupCount}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15, type: "spring", stiffness: 400 }}
                className="flex flex-col items-center gap-0.5 min-w-[100px]"
              >
                <span className="text-4xl font-extrabold text-foreground tabular-nums leading-none">
                  {groupCount}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {groupCount === 1 ? "jogador / grupo" : "jogadores / grupos"}
                </span>
              </motion.div>

              <button
                type="button"
                onClick={increment}
                disabled={groupCount >= MAX_GROUPS}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                  groupCount >= MAX_GROUPS
                    ? "border-border/40 text-muted-foreground/40 cursor-not-allowed"
                    : "border-primary/40 text-primary hover:bg-primary/10 hover:border-primary active:scale-95",
                )}
                aria-label="Aumentar grupos"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Badges de preview de cores dos grupos */}
            {groupCount > 1 && (
              <div className="flex flex-wrap justify-center gap-2 pt-1 border-t border-border/40">
                {Array.from({ length: groupCount }).map((_, i) => {
                  const color = PLAYER_COLORS[i];
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                      style={{
                        background: color.hiddenBg,
                        borderColor: color.hiddenBorder,
                        color: color.accentColor,
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: color.accentColor }}
                      />
                      Grupo {i + 1}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

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
                  ({durationSeconds}s)
                  {groupCount > 1 && (
                    <>
                      , com vez alternada entre os{" "}
                      <strong className="font-semibold text-foreground">
                        {groupCount} grupos
                      </strong>
                      .
                    </>
                  )}
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
            onClick={() => onStart(durationSeconds, autoStart, groupCount)}
            disabled={!canStart}
          >
            <Play className="h-4 w-4 fill-current" />
            {groupCount > 1
              ? `Iniciar jogo (${groupCount} grupos)`
              : "Iniciar jogo"}
          </Button>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
