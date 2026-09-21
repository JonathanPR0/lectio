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
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  Trophy,
  UserCheck,
  UserX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CategoryAnswerGameQuestion } from "../lib/gameTypes";
import { PLAYER_COLORS, type PlayerColor } from "../lib/itoGameUtils";
import { GameRulesHelp } from "./GameRulesHelp";

type SpyPlayerCardProps = {
  playerIndex: number;
  isSpy: boolean;
  answer: string;
  color: PlayerColor;
  hasViewed: boolean;
  onViewed: () => void;
};

function SpyPlayerCard({
  playerIndex,
  isSpy,
  answer,
  color,
  hasViewed,
  onViewed,
}: SpyPlayerCardProps) {
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
      style={{ perspective: "1200px", height: "190px" }}
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
            hasViewed && "opacity-85 ring-1 ring-border/50",
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            backgroundColor: color.hiddenBg,
            borderColor: color.hiddenBorder,
          }}
          onClick={handleReveal}
          role="button"
          aria-label={`${color.label} — toque para revelar seu papel`}
        >
          {/* Topo do card: Nome do jogador + status visto */}
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
                  color: "#ffffff",
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
          className={cn(
            "absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-between p-3.5 overflow-hidden shadow-lg",
            isSpy
              ? "bg-card border-chart-7 text-foreground"
              : "border-primary/40 text-foreground",
          )}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: isSpy ? undefined : color.revealedBg,
            color: isSpy ? undefined : color.revealedText,
          }}
        >
          {/* Topo verso */}
          <div className="w-full flex items-center justify-between">
            <span
              className={cn(
                "text-[11px] font-black uppercase tracking-widest",
                isSpy ? "text-foreground/90" : "text-white/90",
              )}
            >
              {color.label}
            </span>
            {isSpy ? (
              <span className="flex items-center gap-1 rounded-full bg-chart-7 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-secondary-foreground shadow-xs">
                <UserX className="h-3 w-3" />
                Espião
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xs">
                <Shield className="h-3 w-3" />
                Inocente
              </span>
            )}
          </div>

          {/* Conteúdo central limpo e minimalista */}
          {isSpy ? (
            <div className="flex flex-col items-center justify-center text-center my-auto px-1 w-full gap-1">
              <div className="flex items-center gap-1.5 text-chart-7 font-black text-base uppercase tracking-wider">
                <ShieldAlert className="h-5 w-5 animate-pulse text-chart-7" />
                <span>Você é o Espião!</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                Descubra a palavra secreta sem ser pego!
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center my-auto px-1 w-full">
              <span className="text-base md:text-lg font-black text-white uppercase tracking-wide drop-shadow-sm line-clamp-2">
                {answer}
              </span>
            </div>
          )}

          {/* Botão virar */}
          <button
            type="button"
            onClick={handleHide}
            className="flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-extrabold transition-all duration-150 active:scale-95 bg-white/25 hover:bg-white/35 text-white backdrop-blur-sm shadow-xs"
          >
            <RotateCcw className="h-3 w-3 stroke-[2.5]" />
            Virar e esconder
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Componente principal: SpyQuestionCard
// ──────────────────────────────────────────────────────────────────────────────

type SpyQuestionCardProps = {
  question: CategoryAnswerGameQuestion;
  playerCount: number;
  spyIndex: number;
  currentQuestionIndex: number;
  isLastQuestion: boolean;
  winner?: "spy" | "players";
  onVoteOutcome: (winner: "spy" | "players") => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function SpyQuestionCard({
  question,
  playerCount,
  spyIndex,
  currentQuestionIndex,
  isLastQuestion,
  winner,
  onVoteOutcome,
  onNext,
  onPrevious,
}: SpyQuestionCardProps) {
  const [viewedPlayers, setViewedPlayers] = useState<Set<number>>(new Set());
  const prevQuestionId = useRef(question.id);

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
  const spyColor = PLAYER_COLORS[spyIndex];

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto space-y-3"
    >
      <Card className="overflow-hidden border-chart-7/20 shadow-lg shadow-chart-7/5">
        {/* Header: Categoria da rodada */}
        <CardHeader className="border-b bg-muted/20 p-5 md:p-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-chart-7">
            Categoria da Rodada
          </p>
          <p className="whitespace-pre-line text-2xl font-bold leading-8 text-foreground md:text-3xl tracking-tight">
            {question.category}
          </p>
        </CardHeader>

        <CardContent className="p-5 md:p-7 space-y-5">
          {/* Regras do Jogo */}
          <GameRulesHelp type="spy" />

          {/* Instrução de visualização */}
          <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Eye className="h-4 w-4 shrink-0 text-chart-7" />
              <p className="text-sm text-muted-foreground truncate">
                {allViewed ? (
                  <span className="font-semibold text-primary">
                    Todos viram! Conversem e votem no resultado.
                  </span>
                ) : (
                  <>Toquem no cartão para conferir seu papel secreto</>
                )}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-chart-7/10 px-2.5 py-0.5 text-xs font-bold text-chart-7 tabular-nums">
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
                  <SpyPlayerCard
                    playerIndex={i}
                    isSpy={i === spyIndex}
                    answer={question.answer}
                    color={PLAYER_COLORS[i]}
                    hasViewed={viewedPlayers.has(i)}
                    onViewed={() => handlePlayerViewed(i)}
                  />
                </div>
              );
            })}
          </div>

          {/* ── Seção de Votação e Desfecho da Rodada ─────────────────── */}
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Após o debate e a votação, quem venceu a rodada?
            </p>

            {!winner ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onVoteOutcome("players")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-4 px-3 font-semibold text-center transition-all",
                    "border-success/30 bg-success/5 text-success/80 hover:border-success/60 hover:bg-success/15 active:scale-[0.97]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success",
                  )}
                >
                  <UserCheck className="h-6 w-6 text-success" />
                  <div>
                    <span className="text-sm font-bold block">Jogadores Venceram</span>
                    <span className="text-[11px] opacity-75 font-normal block">
                      Inocentes desmascararam o espião (+1 pt)
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onVoteOutcome("spy")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-4 px-3 font-semibold text-center transition-all",
                    "border-chart-7/30 bg-chart-7/5 text-chart-7 hover:border-chart-7/60 hover:bg-chart-7/15 active:scale-[0.97]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-7",
                  )}
                >
                  <UserX className="h-6 w-6 text-chart-7" />
                  <div>
                    <span className="text-sm font-bold block">Espião Venceu</span>
                    <span className="text-[11px] opacity-75 font-normal block">
                      Espião enganou a todos (+2 pts)
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "rounded-xl border p-4 space-y-3",
                  winner === "players"
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-chart-7/30 bg-chart-7/10 text-foreground",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-5 w-5 shrink-0 text-warning" />
                  <div>
                    <p className="text-sm font-bold">
                      {winner === "players"
                        ? "Os Jogadores Venceram a rodada!"
                        : "O Espião Venceu a rodada!"}
                    </p>
                    <p className="text-xs opacity-90">
                      O espião da rodada era o{" "}
                      <strong className="font-extrabold underline">
                        {spyColor.label}
                      </strong>
                      . Palavra secreta:{" "}
                      <strong className="font-extrabold">{question.answer}</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-border/40 text-xs">
                  <span className="font-semibold opacity-90">
                    {winner === "players"
                      ? "+1 ponto para todos os inocentes"
                      : `+2 pontos para o ${spyColor.label}`}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onVoteOutcome(winner === "players" ? "spy" : "players")}
                    className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                  >
                    Alterar resultado
                  </Button>
                </div>
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
            disabled={currentQuestionIndex === 0}
            aria-label="Rodada anterior"
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex-1 flex justify-center">
            {winner && (
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

          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={isLastQuestion && !!winner}
            aria-label="Próxima rodada"
            className="gap-1.5"
          >
            {winner ? "Próxima" : "Pular"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}


