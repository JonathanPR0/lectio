import { Games } from "src/entities/Games";
import z from "zod";

const baseDifficultySchema = z
  .nativeEnum(Games.Difficulty, {
    errorMap: () => ({ message: "'difficulty' must be one of: EASY, MEDIUM, HARD" }),
  })
  .nullable();

// 1. Quiz de Múltipla Escolha (options)
const optionsQuestionSchema = z.object({
  text: z.string().min(1, "'text' is required"),
  difficulty: baseDifficultySchema,
  options: z
    .array(
      z.object({
        text: z.string().min(1, "'text' cannot be empty"),
        isAnswer: z.boolean(),
      }),
    )
    .min(1, "'options' must have at least one option"),
  answer: z.string().min(1, "'answer' is required"),
});

const optionsGameSchema = z.object({
  name: z.string().min(1, "'name' is required"),
  type: z.literal("options"),
  questions: z
    .array(optionsQuestionSchema)
    .min(1, "'questions' must have at least one question"),
});

// 2. Quiz de Verdadeiro ou Falso (boolean)
const booleanQuestionSchema = z.object({
  text: z.string().min(1, "'text' is required"),
  difficulty: baseDifficultySchema,
  options: z
    .array(
      z.object({
        text: z.string().min(1, "'text' cannot be empty"),
        isAnswer: z.boolean(),
      }),
    )
    .optional(),
  answer: z.string().min(1, "'answer' is required"),
});

const booleanGameSchema = z.object({
  name: z.string().min(1, "'name' is required"),
  type: z.literal("boolean"),
  questions: z
    .array(booleanQuestionSchema)
    .min(1, "'questions' must have at least one question"),
});

// 3. Jogos de Performance (charades, drawing, one_word)
const performanceQuestionSchema = z.object({
  text: z.string().min(1, "'text' is required"),
  difficulty: baseDifficultySchema,
  answer: z.string().min(1, "'answer' is required"),
});

const performanceGameSchema = z.object({
  name: z.string().min(1, "'name' is required"),
  type: z.enum(["charades", "one_word"]),
  questions: z
    .array(performanceQuestionSchema)
    .min(1, "'questions' must have at least one question"),
});

// 4. Jogo Taboo / Não Pode (exclusivo com forbiddenWords)
const tabooQuestionSchema = z.object({
  text: z.string().min(1, "'text' is required"),
  difficulty: baseDifficultySchema,
  forbiddenWords: z
    .array(z.string().min(1, "'forbiddenWords' cannot contain empty words"))
    .min(1, "'forbiddenWords' must have at least one word"),
  answer: z.string().min(1, "'answer' is required"),
});

const tabooGameSchema = z.object({
  name: z.string().min(1, "'name' is required"),
  type: z.literal("taboo"),
  questions: z
    .array(tabooQuestionSchema)
    .min(1, "'questions' must have at least one question"),
});

// 5. Jogo Ito (exclusivo com min_label e max_label)
const itoQuestionSchema = z.object({
  text: z.string().min(1, "'text' is required"),
  min_label: z.string().min(1, "'min_label' is required"),
  max_label: z.string().min(1, "'max_label' is required"),
  difficulty: baseDifficultySchema.optional(),
});

const itoGameSchema = z.object({
  name: z.string().min(1, "'name' is required"),
  type: z.literal("ito"),
  questions: z
    .array(itoQuestionSchema)
    .min(1, "'questions' must have at least one question"),
});

// 6. Jogo Just One (Palavra-Chave)
const justOneQuestionSchema = z.object({
  category: z.string().min(1, "'category' is required"),
  answer: z.string().min(1, "'answer' is required"),
  difficulty: baseDifficultySchema.optional(),
});

const justOneGameSchema = z.object({
  name: z.string().min(1, "'name' is required"),
  type: z.literal("just_one"),
  questions: z
    .array(justOneQuestionSchema)
    .min(1, "'questions' must have at least one question"),
});

// 7. Jogo Spy / Spyfall (Descubra o Espião)
const spyQuestionSchema = z.object({
  category: z.string().min(1, "'category' is required"),
  answer: z.string().min(1, "'answer' is required"),
  difficulty: baseDifficultySchema.optional(),
});

const spyGameSchema = z.object({
  name: z.string().min(1, "'name' is required"),
  type: z.literal("spy"),
  questions: z
    .array(spyQuestionSchema)
    .min(1, "'questions' must have at least one question"),
});

export const createGameSchema = z.discriminatedUnion("type", [
  optionsGameSchema,
  booleanGameSchema,
  performanceGameSchema,
  tabooGameSchema,
  itoGameSchema,
  justOneGameSchema,
  spyGameSchema,
]);

export type CreateGameBody = z.infer<typeof createGameSchema>;


