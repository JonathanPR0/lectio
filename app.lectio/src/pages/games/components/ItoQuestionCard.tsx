import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ItoGameQuestion } from "../lib/gameTypes";
import { PLAYER_COLORS, type PlayerColor } from "../lib/itoGameUtils";
import { GameRulesHelp } from "./GameRulesHelp";
import { QuestionTimer } from "./QuestionTimer";

// ──────────────────────────────────────────────────────────────────────────────
// Subcomponente: cartão individual de cada jogador com efeito de virada 3D
// ──────────────────────────────────────────────────────────────────────────────

type PlayerCardProps = {
  playerIndex: number;
  playerNumber: number;
  color: PlayerColor;
  hasViewed: boolean;
  onViewed: () => void;
};

function PlayerCard({
  playerIndex,
  playerNumber,
  color,
  hasViewed,
  onViewed,
}: PlayerCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleHide = () => {
    setIsRevealed(false);
    onViewed();
  };

  return (
    <div
      className="relative select-none"
      style={{ perspective: "1200px", height: "185px" }}
    >
      <motion.div
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{
          duration: 0.55,
          type: "spring",
          stiffness: 180,
          damping: 22,
        }}
        style={{ transformStyle: "preserve-3d", position: "relative", height: "100%" }}
      >
        {/* ── FRENTE (oculto) ───────────────────────────────────── */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-between p-3.5 cursor-pointer transition-all duration-200",
            "bg-card shadow-sm hover:shadow-md active:scale-[0.98]",
            hasViewed && "opacity-80 ring-1 ring-border/50",
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            backgroundColor: color.hiddenBg,
            borderColor: color.hiddenBorder,
          }}
          onClick={handleReveal}
          role="button"
          aria-label={`${color.label} — toque para revelar seu número`}
        >
          {/* Topo do card: Nome do jogador + status visto sem sobreposição */}
          <div className="w-full flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: color.accentColor }}
              />
              <span
                className="text-xs font-black uppercase tracking-wider truncate"
                style={{ color: color.accentColor }}
              >
                {color.label}
              </span>
            </div>

            {hasViewed && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-2xs leading-none"
                style={{
                  background: color.accentColor,
                  color: "var(--player-badge-text, #ffffff)",
                }}
              >
                ✓ Visto
              </span>
            )}
          </div>

          {/* Ícone central */}
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={isRevealed ? {} : { scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: color.iconBg }}
            >
              <EyeOff
                className="h-5 w-5"
                style={{ color: color.accentColor }}
              />
            </motion.div>
            <span
              className="text-xs font-bold"
              style={{ color: color.accentColor }}
            >
              Toque para ver
            </span>
          </div>

          {/* Rodapé */}
          <span className="text-[11px] font-semibold text-muted-foreground">
            Jogador {playerIndex + 1}
          </span>
        </div>

        {/* ── VERSO (revelado) ──────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-between p-4 overflow-hidden shadow-md"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: color.revealedBg,
            borderColor: "transparent",
            color: color.revealedText,
          }}
        >
          {/* Nome do jogador */}
          <div className="flex items-center gap-1.5 opacity-90">
            <span className="text-xs font-black uppercase tracking-widest text-white">
              {color.label}
            </span>
          </div>

          {/* Número secreto */}
          <div className="flex flex-col items-center gap-0">
            <span className="text-6xl font-black leading-none tabular-nums text-white drop-shadow-sm">
              {playerNumber}
            </span>
            <span className="text-[11px] font-bold opacity-90 text-white mt-1">
              seu número secreto
            </span>
          </div>

          {/* Botão virar */}
          <button
            type="button"
            onClick={handleHide}
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-extrabold transition-all duration-150 active:scale-95 bg-white/25 hover:bg-white/35 text-white backdrop-blur-sm shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
            Virar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Componente principal: ItoQuestionCard
// ──────────────────────────────────────────────────────────────────────────────

type ItoQuestionCardProps = {
  question: ItoGameQuestion;
  playerCount: number;
  playerNumbers: number[];
  currentQuestionIndex: number;
  isLastQuestion: boolean;
  timeLimitSeconds?: number;
  autoStartTimer?: boolean;
  onNext: () => void;
  onPrevious: () => void;
};

export function ItoQuestionCard({
  question,
  playerCount,
  playerNumbers,
  currentQuestionIndex,
  isLastQuestion,
  timeLimitSeconds,
  autoStartTimer = false,
  onNext,
  onPrevious,
}: ItoQuestionCardProps) {
  const [viewedPlayers, setViewedPlayers] = useState<Set<number>>(new Set());
  const prevQuestionId = useRef(question.id);

  // Resetar estado ao mudar de questão
  useEffect(() => {
    if (prevQuestionId.current !== question.id) {
      setViewedPlayers(new Set());
      prevQuestionId.current = question.id;
    }
  }, [question.id]);

  const handlePlayerViewed = useCallback((playerIndex: number) => {
    setViewedPlayers((prev) => {
      const next = new Set(prev);
      next.add(playerIndex);
      return next;
    });
  }, []);

  const allViewed = viewedPlayers.size >= playerCount;
  const viewedCount = viewedPlayers.size;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto space-y-3"
    >
      <Card className="overflow-hidden border-primary/15 shadow-lg shadow-primary/5">
        {/* Header: Tema / Desafio Ito */}
        <CardHeader className="border-b bg-muted/20 p-5 md:p-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Tema / Desafio
          </p>
          <p className="whitespace-pre-line text-xl font-bold leading-8 text-foreground md:text-2xl">
            {question.text}
          </p>
        </CardHeader>

        <CardContent className="p-5 md:p-7 space-y-5">
          {/* Regras do Jogo */}
          <GameRulesHelp type="ito" />

          {/* Temporizador da rodada Ito */}
          {!!timeLimitSeconds && (
            <QuestionTimer
              key={question.id}
              durationSeconds={timeLimitSeconds}
              autoStart={autoStartTimer}
              disabled={false}
              onExpire={() => {}}
            />
          )}

          {/* Escala visual */}
          <div className="space-y-2">
            <div className="relative">
              {/* Trilho */}
              <div className="h-2 w-full rounded-full bg-primary/30" />
              {/* Marcadores 1 e 100 */}
              <div className="flex justify-between mt-1">
                <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
                  1
                </span>
                <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
                  100
                </span>
              </div>
            </div>
            {/* Labels */}
            <div className="flex justify-between gap-2">
              <div className="flex-1 rounded-xl border border-border/50 bg-muted/40 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  ← Mínimo
                </p>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {question.min_label}
                </p>
              </div>
              <div className="flex-1 rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Máximo →
                </p>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {question.max_label}
                </p>
              </div>
            </div>
          </div>

          {/* Instrução e progresso de visualização */}
          <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Eye className="h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground truncate">
                {allViewed ? (
                  <span className="font-semibold text-success">
                    Todos viram seus números! Conversem e ordenem.
                  </span>
                ) : (
                  <>Cada jogador toque no cartão para ver o número secreto</>
                )}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary tabular-nums">
              {viewedCount}/{playerCount}
            </span>
          </div>

          {/* Grid de cartões dos jogadores */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: playerCount }).map((_, i) => {
              const isOddTotal = playerCount % 2 !== 0;
              const isLastCard = i === playerCount - 1;
              const shouldCenterLast = isOddTotal && isLastCard;

              return (
                <div
                  key={i}
                  className={cn(
                    "w-full",
                    shouldCenterLast &&
                      "col-span-2 justify-self-center max-w-[calc(50%-0.375rem)]",
                  )}
                >
                  <PlayerCard
                    playerIndex={i}
                    playerNumber={playerNumbers[i] ?? 0}
                    color={PLAYER_COLORS[i]}
                    hasViewed={viewedPlayers.has(i)}
                    onViewed={() => handlePlayerViewed(i)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>

        {/* Footer: navegação e ação principal padronizada */}
        <CardFooter className="border-t bg-muted/10 flex items-center justify-between gap-2 p-4 md:p-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
            aria-label="Rodada anterior"
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex-1 flex justify-end">
            {allViewed ? (
              <Button
                onClick={onNext}
                size="sm"
                className="gap-1.5 px-5 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLastQuestion ? "Finalizar jogo" : "Próxima questão"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) :(
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={isLastQuestion && allViewed}
                aria-label="Próxima questão"
                className="gap-1.5"
              >
                Pular
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>


        </CardFooter>
      </Card>
    </motion.div>
  );
}


