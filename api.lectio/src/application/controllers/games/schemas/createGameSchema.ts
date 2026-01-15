import { Games } from "src/entities/Games";
import z from "zod";

export const createGameSchema = z.object({
  name: z.string().min(1, "'name' is required"),
  type: z.enum(["options", "boolean"]),
  questions: z
    .array(
      z.object({
        text: z.string().min(1, "'text' is required"),
        difficulty: z
          .nativeEnum(Games.Difficulty, {
            errorMap: () => ({ message: "'difficulty' must be one of: EASY, MEDIUM, HARD" }),
          })
          .nullable(),
        options: z
          .array(
            z.object({
              text: z.string().min(1, "'text' cannot be empty"),
              isAnswer: z.boolean(),
            })
          )
          .min(1, "'options' must have at least one option"),
        answer: z.string().min(1, "'answer' is required"),
      })
    )
    .min(1, "'questions' must have at least one question"),
});

export type CreateGameBody = z.infer<typeof createGameSchema>;
