import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMetaTags } from "@/hooks/useMetaTags";
import { httpClient } from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  ChevronRight,
  Gamepad2,
  ListChecks,
  Pencil,
  PersonStanding,
  Search,
  Type,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameTypeBadgeColors, gameTypeLabels } from "./lib/gameConfig";
import type { GameType } from "./lib/gameTypes";

interface Game {
  id: string;
  name: string;
  type: GameType;
  questionsQtde: number;
}

const gameTypeIcons: Record<GameType, React.ElementType> = {
  options: ListChecks,
  boolean: CheckCircle2,
  charades: PersonStanding,
  drawing: Pencil,
  one_word: Type,
  taboo: Ban,
};

function GameCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-3/5 rounded" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-2/5 rounded" />
    </div>
  );
}

export function GamesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  useMetaTags({
    title: "Jogos - Lectio",
    description:
      "Teste seus conhecimentos bíblicos com diversos jogos e quizzes",
    ogImage: "/og-default.png",
  });

  const {
    data: games,
    isLoading,
    isError,
  } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: async () => {
      const response = await httpClient
        .get("/games")
        .then((res) => res.data.games);
      return response;
    },
  });

  const filteredGames = useMemo(() => {
    if (!searchTerm.trim()) return games ?? [];
    return (games ?? []).filter((game) =>
      game.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, games]);

  const handleGameClick = (game: Game) => {
    navigate(`/games/${game.id}`, { state: { game } });
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Cabeçalho */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Gamepad2 className="h-6 w-6 text-primary" aria-hidden />
            <h1 className="text-2xl font-bold text-foreground">Jogos</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Escolha um jogo e teste seus conhecimentos bíblicos
          </p>
        </div>

        {/* Barra de busca */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="games-search"
            type="search"
            placeholder="Buscar jogos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Buscar jogos"
          />
        </div>

        {/* Lista de jogos */}
        {isLoading ? (
          <div
            className="grid gap-4 md:grid-cols-2"
            aria-busy="true"
            aria-label="Carregando jogos"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <AlertCircle className="h-10 w-10 text-destructive/60" />
            <p className="font-medium text-foreground">
              Não foi possível carregar os jogos
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique sua conexão e tente novamente.
            </p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Search className="h-10 w-10 text-muted-foreground/40" />
            {searchTerm ? (
              <p className="text-muted-foreground">
                Nenhum jogo encontrado para{" "}
                <strong className="text-foreground">"{searchTerm}"</strong>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Nenhum jogo disponível no momento.
              </p>
            )}
          </div>
        ) : (
          <ul
            className="grid gap-4 md:grid-cols-2"
            role="list"
            aria-label="Lista de jogos"
          >
            {filteredGames.map((game, index) => {
              const Icon = gameTypeIcons[game.type];
              return (
                <motion.li
                  key={game.id}
                  role="listitem"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                >
                  <Card
                    className={
                      "cursor-pointer transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 active:scale-[0.99]"
                    }
                    onClick={() => handleGameClick(game)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Jogar ${game.name}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleGameClick(game);
                      }
                    }}
                  >
                    <CardHeader className="pb-2 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Icon
                              className="h-4 w-4 text-primary"
                              aria-hidden
                            />
                          </div>
                          <p className="font-semibold text-foreground leading-tight truncate">
                            {game.name}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-xs ${gameTypeBadgeColors[game.type]}`}
                        >
                          {gameTypeLabels[game.type]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{game.questionsQtde} questões</span>
                        <span className="flex items-center gap-1 text-primary font-medium text-xs">
                          Jogar
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
