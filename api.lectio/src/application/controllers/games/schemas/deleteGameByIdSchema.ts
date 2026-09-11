import { z } from "zod";

export const deleteGameByIdSchema = z.object({
  gameId: z.string().min(1, "O id do jogo é obrigatório."),
});
