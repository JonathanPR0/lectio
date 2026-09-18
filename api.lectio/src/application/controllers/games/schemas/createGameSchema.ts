import { Games } from "src/entities/Games";
import z from "zod";

export const createGameSchema = z.object({
  name: z.string().min(1, "'name' is required"),
  type: z.enum(["options", "boolean", "charades", "drawing", "one_word", "taboo"]),
  questions: z
    .array(
      z.object({
        text: z.string().min(1, "'text' is required"),
        difficulty: z
          .nativeEnum(Games.Difficulty, {
            errorMap: () => ({ message: "'difficulty' must be one of: EASY, MEDIUM, HARD" }),
          })
          .nullable(),
        forbiddenWords: z
          .array(z.string().min(1, "'forbiddenWords' cannot contain empty words"))
          .optional(),
        options: z
          .array(
            z.object({
              text: z.string().min(1, "'text' cannot be empty"),
              isAnswer: z.boolean(),
            }),
          )
          .min(1, "'options' must have at least one option")
          .optional(),
        answer: z.string().min(1, "'answer' is required"),
      }),
    )
    .min(1, "'questions' must have at least one question"),
});

export type CreateGameBody = z.infer<typeof createGameSchema>;
