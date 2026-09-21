import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Minus, Play, Plus, UserX, Users } from "lucide-react";
import { useState } from "react";
import { PLAYER_COLORS } from "../lib/itoGameUtils";
import { GameRulesHelp } from "./GameRulesHelp";

type SpyGameSetupProps = {
  gameName: string;
  onStart: (playerCount: number) => void;
  initialPlayerCount?: number;
};

export function SpyGameSetup({
  gameName,
  onStart,
  initialPlayerCount = 4,
}: SpyGameSetupProps) {
  const [playerCount, setPlayerCount] = useState(initialPlayerCount);

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
        <Card className="overflow-hidden border-chart-7/20 shadow-xl shadow-chart-7/5">
          <CardHeader className="border-b bg-muted/30 p-6 space-y-1">
            <div className="flex items-center gap-2 text-chart-7 mb-1">
              <UserX className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                Configurar partida
              </p>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {gameName}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Descubra quem entre vocês é o espião infiltrado antes que ele descubra a resposta secreta!
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Regras do Jogo (Padrão) */}
            <GameRulesHelp type="spy" defaultOpen={true} />

            {/* Seletor de jogadores */}
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-chart-7" />
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
                      : "border-chart-7/40 text-chart-7 hover:bg-chart-7/10 hover:border-chart-7 active:scale-95",
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
                      : "border-chart-7/40 text-chart-7 hover:bg-chart-7/10 hover:border-chart-7 active:scale-95",
                  )}
                  aria-label="Aumentar número de jogadores"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Preview dos jogadores */}
              <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-border/40">
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

            {/* Botão iniciar */}
            <Button
              className="w-full font-semibold gap-2 bg-chart-7 hover:bg-chart-7/90 text-secondary-foreground"
              size="lg"
              onClick={() => onStart(playerCount)}
            >
              <Play className="h-4 w-4 fill-current" />
              Iniciar partida com {playerCount} jogadores
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
