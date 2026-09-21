import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock, Minus, Play, Plus, Users, Zap } from "lucide-react";
import { useState } from "react";
import { PLAYER_COLORS } from "../lib/itoGameUtils";
import { TimeWheelPicker } from "./TimeWheelPicker";

type ItoGameSetupProps = {
  gameName: string;
  onStart: (
    playerCount: number,
    durationSeconds: number,
    autoStart: boolean,
  ) => void;
  initialTimeLimitSeconds?: number;
  initialAutoStart?: boolean;
};

export function ItoGameSetup({
  gameName,
  onStart,
  initialTimeLimitSeconds,
  initialAutoStart = false,
}: ItoGameSetupProps) {
  const [playerCount, setPlayerCount] = useState(4);

  const initialMinutes = initialTimeLimitSeconds
    ? Math.min(5, Math.floor(initialTimeLimitSeconds / 60))
    : 2;
  const initialSeconds = initialTimeLimitSeconds
    ? initialMinutes >= 5
      ? 0
      : initialTimeLimitSeconds % 60
    : 0;

  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [autoStart, setAutoStart] = useState(initialAutoStart);

  const durationSeconds = Math.min(
    300,
    minutes * 60 + (minutes >= 5 ? 0 : seconds),
  );
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const MIN_PLAYERS = 3;
  const MAX_PLAYERS = 8;

  const decrement = () =>
    setPlayerCount((n) => Math.max(MIN_PLAYERS, n - 1));
  const increment = () =>
    setPlayerCount((n) => Math.min(MAX_PLAYERS, n + 1));

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background flex items-start justify-center px-4 py-8 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="overflow-hidden border-primary/20 shadow-xl shadow-primary/5">
          <CardHeader className="border-b bg-muted/30 p-6 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Configurar partida
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {gameName}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No Ito, cada jogador recebe um número secreto de{" "}
              <strong className="text-foreground">1 a 100</strong>. Sem
              revelar o número, todos devem se ordenar na escala temática!
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Regras rápidas */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Como jogar
              </p>
              <ul className="space-y-1.5">
                {[
                  "Cada jogador vê seu número em segredo tocando no seu cartão",
                  "Sem revelar o número, conversem e se posicionem na escala temática",
                  "O tempo corre enquanto vocês debatem e organizam a ordem!",
                ].map((rule, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Seletor de jogadores */}
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Quantas pessoas vão jogar?
                </span>
              </div>

              <div className="flex items-center justify-center gap-6 py-1">
                <button
                  type="button"
                  onClick={decrement}
                  disabled={playerCount <= MIN_PLAYERS}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-200",
                    playerCount <= MIN_PLAYERS
                      ? "border-border/40 text-muted-foreground/40 cursor-not-allowed"
                      : "border-primary/40 text-primary hover:bg-primary/10 hover:border-primary active:scale-95",
                  )}
                  aria-label="Diminuir número de jogadores"
                >
                  <Minus className="h-5 w-5" />
                </button>

                <motion.div
                  key={playerCount}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15, type: "spring", stiffness: 400 }}
                  className="flex flex-col items-center gap-0.5"
                >
                  <span className="text-5xl font-extrabold text-foreground tabular-nums leading-none">
                    {playerCount}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {playerCount === 1 ? "jogador" : "jogadores"}
                  </span>
                </motion.div>

                <button
                  type="button"
                  onClick={increment}
                  disabled={playerCount >= MAX_PLAYERS}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-200",
                    playerCount >= MAX_PLAYERS
                      ? "border-border/40 text-muted-foreground/40 cursor-not-allowed"
                      : "border-primary/40 text-primary hover:bg-primary/10 hover:border-primary active:scale-95",
                  )}
                  aria-label="Aumentar número de jogadores"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Preview dos jogadores */}
              <div className="flex flex-wrap justify-center gap-2 pt-1 border-t border-border/40">
                {Array.from({ length: playerCount }).map((_, i) => {
                  const color = PLAYER_COLORS[i];
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
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
                      {color.label}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Tempo por rodada */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Tempo para debate na rodada
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

            {/* Resumo do tempo */}
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <Clock className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm">
                Cada rodada terá limite de{" "}
                <strong className="font-semibold text-foreground">
                  {formattedTime}
                </strong>{" "}
                ({durationSeconds} segundos).
              </p>
            </div>

            {/* Opção de início automático */}
            <label
              htmlFor="ito-auto-start"
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors",
                autoStart
                  ? "border-primary/30 bg-primary/5"
                  : "hover:bg-muted/50 border-border/60",
              )}
            >
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  id="ito-auto-start"
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
                    Iniciar cronômetro automaticamente
                  </span>
                </div>
                <span className="mt-1 block text-xs text-muted-foreground leading-relaxed">
                  {autoStart
                    ? "O tempo começará a contar assim que a rodada for carregada."
                    : 'Você poderá iniciar o tempo quando todos estiverem prontos.'}
                </span>
              </div>
            </label>

            {/* Botão iniciar */}
            <Button
              className="w-full font-semibold gap-2"
              size="lg"
              onClick={() => onStart(playerCount, durationSeconds, autoStart)}
            >
              <Play className="h-4 w-4 fill-current" />
              Iniciar jogo com {playerCount} jogadores
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
