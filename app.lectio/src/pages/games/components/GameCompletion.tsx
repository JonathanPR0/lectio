import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GroupScore } from "@/store/gameAnswersStore";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  Medal,
  RefreshCw,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { GameScore } from "../lib/gameTypes";
import { PLAYER_COLORS } from "../lib/itoGameUtils";

type GameCompletionProps = {
  gameName: string;
  gameType?: string;
  totalQuestions?: number;
  score: GameScore;
  groupScores?: GroupScore[];
  spyScores?: number[];
  onReview?: () => void;
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
  gameType,
  totalQuestions,
  score,
  groupScores,
  spyScores,
  onReview,
  onReset,
  onBack,
}: GameCompletionProps) {
  const isIto = gameType === "ito";
  const isSpy = gameType === "spy";
  const isJustOne = gameType === "just_one";

  const percentage = score.total
    ? Math.round((score.correct / score.total) * 100)
    : 0;

  const hasGroups = Boolean(!isIto && !isSpy && !isJustOne && groupScores && groupScores.length > 1);

  // Ordenar grupos por pontos decrescentes
  const sortedGroups = hasGroups
    ? [...groupScores!].sort((a, b) => b.points - a.points || b.correct - a.correct)
    : [];

  const winningGroup = sortedGroups[0];

  // Ordenar jogadores do spy por pontos
  const sortedSpyPlayers = isSpy && spyScores
    ? spyScores
        .map((pts, idx) => ({ playerIndex: idx, points: pts }))
        .sort((a, b) => b.points - a.points)
    : [];

  const spyWinner = sortedSpyPlayers[0];

  const justOneLabel = isJustOne
    ? score.correct === 13
      ? "Pontuação Perfeita! 🏆"
      : score.correct >= 11
        ? "Incrível! Excelente sintonia! ⭐"
        : score.correct >= 9
          ? "Muito bem! Ótimo trabalho em equipe! 🎯"
          : score.correct >= 7
            ? "Bom trabalho! Dá para melhorar! 👏"
            : "Continuem treinando as pistas! 💪"
    : "";

  const performanceLabel = isIto
    ? "Partida Concluída!"
    : isSpy
      ? spyWinner
        ? `Vitória do Jogador ${spyWinner.playerIndex + 1}!`
        : "Partida Concluída!"
      : isJustOne
        ? justOneLabel
        : hasGroups
          ? `Vitória do Grupo ${winningGroup.groupIndex + 1}!`
          : percentage >= 90
            ? "Excelente!"
            : percentage >= 70
              ? "Muito bem!"
              : percentage >= 50
                ? "Bom trabalho."
                : "Continue praticando.";

  const PerformanceIcon =
    isIto || isSpy || isJustOne || percentage >= 70 || hasGroups ? Trophy : Target;

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center bg-background p-4 md:p-6">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-primary/20 shadow-xl shadow-primary/5">
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
            {/* ── Visualização especial para Ito ──────────────────────── */}
            {isIto ? (
              <div className="space-y-4 text-center">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2">
                  <p className="text-base font-bold text-foreground">
                    Vocês completaram todas as rodadas!
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Esperamos que todos tenham conseguido ordenar seus números
                    secretos de 1 a 100 na escala temática sem revelar!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4">
                  <ScoreStat
                    label="Rodadas jogadas"
                    value={totalQuestions ?? score.total}
                    highlight
                  />
                  <ScoreStat label="Formato" value="Cooperativo" />
                </div>
              </div>
            ) : isSpy ? (
              /* ── Visualização especial para Spy (Placar Individual) ─── */
              <div className="space-y-4">
                <div className="rounded-xl border border-chart-7/20 bg-chart-7/5 p-4 text-center space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    Classificação Final da Partida
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalQuestions ?? score.total} rodadas jogadas com deduções e blefes!
                  </p>
                </div>

                <div className="space-y-2">
                  {sortedSpyPlayers.map((player, rank) => {
                    const color = PLAYER_COLORS[player.playerIndex % PLAYER_COLORS.length];
                    const isChampion = rank === 0;

                    return (
                      <div
                        key={player.playerIndex}
                        className={cn(
                          "flex items-center justify-between rounded-xl border p-3 transition-all",
                          isChampion && "ring-2 ring-amber-500/50 shadow-xs",
                        )}
                        style={{
                          backgroundColor: color.hiddenBg,
                          borderColor: isChampion ? "var(--warning, #f59e0b)" : color.hiddenBorder,
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-foreground">
                            {rank === 0 ? (
                              <Medal className="h-5 w-5 text-amber-500" />
                            ) : rank === 1 ? (
                              <Medal className="h-5 w-5 text-slate-400" />
                            ) : rank === 2 ? (
                              <Medal className="h-5 w-5 text-amber-700" />
                            ) : (
                              `${rank + 1}º`
                            )}
                          </span>
                          <div>
                            <span
                              className="text-sm font-bold block"
                              style={{ color: color.accentColor }}
                            >
                              {color.label}
                            </span>
                            {isChampion && (
                              <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                Campeão 🏆
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className="text-xl font-black tabular-nums"
                            style={{ color: color.accentColor }}
                          >
                            {player.points}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                            pontos
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : isJustOne ? (
              /* ── Visualização especial para Just One (Palavra-Chave) ── */
              <div className="space-y-4 text-center">
                <div className="rounded-xl border border-chart-3/20 bg-chart-3/5 p-5 space-y-2">
                  <span className="text-5xl font-black text-chart-3 tabular-nums">
                    {score.correct} <span className="text-2xl text-muted-foreground font-semibold">/ {totalQuestions ?? 13}</span>
                  </span>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-1">
                    Palavras Adivinhadas Corretamente
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4">
                  <ScoreStat
                    label="Acertos"
                    value={`${score.correct} / ${totalQuestions ?? 13}`}
                    highlight
                  />
                  <ScoreStat label="Formato" value="Cooperativo" />
                </div>
              </div>
            ) : (
              <>
                {/* ── Placar por Grupos se houver múltiplos grupos ────── */}
                {hasGroups && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Classificação dos Grupos
                      </p>
                    </div>

                    <div className="space-y-2">
                      {sortedGroups.map((group, rank) => {
                        const color =
                          PLAYER_COLORS[group.groupIndex % PLAYER_COLORS.length];
                        const isWinner = rank === 0;

                        return (
                          <div
                            key={group.groupIndex}
                            className={cn(
                              "flex items-center justify-between rounded-xl border p-3 transition-all",
                              isWinner && "ring-2 ring-primary/40",
                            )}
                            style={{
                              backgroundColor: color.hiddenBg,
                              borderColor: color.hiddenBorder,
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-foreground">
                                {rank === 0 ? (
                                  <Medal className="h-5 w-5 text-amber-500" />
                                ) : (
                                  `${rank + 1}º`
                                )}
                              </span>
                              <div>
                                <span
                                  className="text-sm font-bold block"
                                  style={{ color: color.accentColor }}
                                >
                                  Grupo {group.groupIndex + 1}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {group.correct} de {group.total} acertos
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span
                                className="text-lg font-black tabular-nums"
                                style={{ color: color.accentColor }}
                              >
                                {group.points}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                                pts
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Percentual geral em destaque */}
                {!hasGroups && (
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
                )}

                {/* Stats gerais */}
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
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Feedback de conclusão */}
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/15 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Total de{" "}
                    <strong className="text-foreground">{score.correct}</strong> de{" "}
                    <strong className="text-foreground">{score.total}</strong>{" "}
                    questões respondidas corretamente.
                  </p>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t bg-muted/10 p-5">
            {onReview && (
              <Button onClick={onReview} className="w-full" variant="outline">
                Revisar respostas
              </Button>
            )}
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
