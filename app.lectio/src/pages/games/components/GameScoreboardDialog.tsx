import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { GroupScore } from "@/store/gameAnswersStore";
import {
  Medal,
  Trophy,
  UserX,
  Users,
} from "lucide-react";
import type { GameScore, GameType } from "../lib/gameTypes";
import { PLAYER_COLORS } from "../lib/itoGameUtils";

type GameScoreboardDialogProps = {
  gameType: GameType;
  gameName: string;
  currentIndex: number;
  totalQuestions: number;
  score: GameScore;
  groupScores?: GroupScore[];
  spyScores?: number[];
  spyPlayerCount?: number;
  justOneReserveCount?: number;
  trigger?: React.ReactNode;
};

export function GameScoreboardDialog({
  gameType,
  gameName,
  currentIndex,
  totalQuestions,
  score,
  groupScores,
  spyScores,
  spyPlayerCount,
  justOneReserveCount = 0,
  trigger,
}: GameScoreboardDialogProps) {
  const isSpy = gameType === "spy";
  const isJustOne = gameType === "just_one";
  const hasGroups = Boolean(groupScores && groupScores.length > 1);

  // Ordenar jogadores do Spy
  const sortedSpyPlayers =
    isSpy && spyScores
      ? spyScores
          .slice(0, spyPlayerCount ?? spyScores.length)
          .map((pts, idx) => ({ playerIndex: idx, points: pts }))
          .sort((a, b) => b.points - a.points)
      : [];

  // Ordenar grupos
  const sortedGroups = hasGroups
    ? [...groupScores!].sort(
        (a, b) => b.points - a.points || b.correct - a.correct,
      )
    : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-2xs transition-all hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-foreground active:scale-95"
            title="Ver placar atual"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Placar</span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md p-6 gap-5">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Placar da Partida
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {gameName} • Rodada {currentIndex + 1} de {totalQuestions}
                </DialogDescription>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] font-bold shrink-0">
              {currentIndex + 1}/{totalQuestions}
            </Badge>
          </div>
        </DialogHeader>

        {/* ── Conteúdo de acordo com o jogo ───────────────────────── */}
        <div className="space-y-4">
          {/* 1. Jogo Espião (Spy) */}
          {isSpy && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
                <span className="flex items-center gap-1.5">
                  <UserX className="h-3.5 w-3.5 text-chart-7" />
                  Jogadores & Pontuações
                </span>
                <span>
                  {sortedSpyPlayers.reduce((sum, p) => sum + p.points, 0)} pts totais
                </span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {sortedSpyPlayers.map((player, rank) => {
                  const color =
                    PLAYER_COLORS[player.playerIndex % PLAYER_COLORS.length];
                  const isLeader = rank === 0 && player.points > 0;

                  return (
                    <div
                      key={player.playerIndex}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-2.5 transition-all",
                        isLeader && "ring-1 ring-amber-500/40 bg-amber-500/5",
                      )}
                      style={{
                        backgroundColor: color.hiddenBg,
                        borderColor: isLeader
                          ? "var(--warning, #f59e0b)"
                          : color.hiddenBorder,
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-foreground">
                          {rank === 0 ? (
                            <Medal className="h-4 w-4 text-amber-500" />
                          ) : rank === 1 ? (
                            <Medal className="h-4 w-4 text-slate-400" />
                          ) : rank === 2 ? (
                            <Medal className="h-4 w-4 text-amber-700" />
                          ) : (
                            `${rank + 1}º`
                          )}
                        </span>
                        <div className="min-w-0">
                          <span
                            className="text-xs font-bold block truncate"
                            style={{ color: color.accentColor }}
                          >
                            {color.label}
                          </span>
                          {isLeader && (
                            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                              Líder atual 👑
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className="text-base font-black tabular-nums"
                          style={{ color: color.accentColor }}
                        >
                          {player.points}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-muted-foreground block leading-none">
                          pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-muted-foreground text-center pt-1 border-t border-border/40">
                Inocentes ganham 1 pt • Espião ganha 2 pts ao vencer
              </p>
            </div>
          )}

          {/* 2. Jogo em Grupos (Mímica, Não Pode, Uma Palavra) */}
          {hasGroups && !isSpy && !isJustOne && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Classificação dos Grupos
                </span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {sortedGroups.map((group, rank) => {
                  const color =
                    PLAYER_COLORS[group.groupIndex % PLAYER_COLORS.length];
                  const isLeader = rank === 0 && group.points > 0;

                  return (
                    <div
                      key={group.groupIndex}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-2.5 transition-all",
                        isLeader && "ring-1 ring-primary/40",
                      )}
                      style={{
                        backgroundColor: color.hiddenBg,
                        borderColor: color.hiddenBorder,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-foreground">
                          {rank === 0 ? (
                            <Medal className="h-4 w-4 text-amber-500" />
                          ) : (
                            `${rank + 1}º`
                          )}
                        </span>
                        <div>
                          <span
                            className="text-xs font-bold block"
                            style={{ color: color.accentColor }}
                          >
                            Grupo {group.groupIndex + 1}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {group.correct} de {group.total} acertos
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className="text-base font-black tabular-nums"
                          style={{ color: color.accentColor }}
                        >
                          {group.points}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-muted-foreground block leading-none">
                          pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Jogo Just One (Palavra-Chave) */}
          {isJustOne && (
            <div className="space-y-3 text-center">
              <div className="rounded-xl border border-chart-3/20 bg-chart-3/5 p-4 space-y-1">
                <span className="text-3xl font-black text-chart-3 tabular-nums">
                  {score.correct} <span className="text-lg text-muted-foreground font-semibold">/ {totalQuestions}</span>
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Palavras Adivinhadas
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="rounded-lg border bg-muted/30 p-2.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                    No Baralho Reserva
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {justOneReserveCount} cartas
                  </span>
                </div>
                <div className="rounded-lg border bg-muted/30 p-2.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                    Formato
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    Cooperativo
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Jogos normais / Single Group */}
          {!isSpy && !isJustOne && !hasGroups && (
            <div className="grid grid-cols-3 gap-2 rounded-xl border bg-muted/30 p-3 text-center">
              <div>
                <span className="text-lg font-bold text-primary block">
                  {score.correct}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Acertos
                </span>
              </div>
              <div>
                <span className="text-lg font-bold text-foreground block">
                  {score.total}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Respondidas
                </span>
              </div>
              <div>
                <span className="text-lg font-bold text-primary block">
                  {score.points}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Pontos
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogClose asChild>
          <Button variant="outline" className="w-full text-xs font-semibold">
            Fechar
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
