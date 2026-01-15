import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { useMetaTags } from "@/hooks/useMetaTags";
import { httpClient } from "@/services/httpClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Game {
  id: string;
  name: string;
  type: "options" | "boolean";
  questionsQtde: number;
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

  const { data: games, isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: async () => {
      const response = await httpClient
        .get("/games")
        .then((res) => res.data.games);
      return response;
    },
  });

  // Filtrar jogos pelo nome
  const filteredGames = useMemo(() => {
    if (!searchTerm.trim()) return games || [];

    return games
      ? games?.filter((game) =>
          game.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : [];
  }, [searchTerm, games]);

  const handleGameClick = (game: Game) => {
    navigate(`/games/${game.id}`, { state: { game } });
  };

  const getGameTypeLabel = (type: string) => {
    return type === "options" ? "Opções" : "Verdadeiro/Falso";
  };

  const getGameTypeVariant = (type: string): "default" | "secondary" => {
    return type === "options" ? "default" : "secondary";
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Jogos</h1>
          </div>
          <p className="text-muted-foreground">
            Escolha um jogo e teste seus conhecimentos bíblicos
          </p>
        </div>

        {/* Barra de busca */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar jogos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de jogos */}
        {isLoadingGames ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Carregando jogos...</p>
            </div>
          </div>
        ) : filteredGames?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum jogo encontrado com "{searchTerm}"
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredGames?.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleGameClick(game)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{game?.name}</CardTitle>
                      <Badge variant={getGameTypeVariant(game?.type)}>
                        {getGameTypeLabel(game?.type)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{game?.questionsQtde} questões</span>
                      <span className="text-primary font-medium">Jogar →</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
