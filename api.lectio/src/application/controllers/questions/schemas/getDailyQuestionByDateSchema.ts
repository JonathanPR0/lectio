import z from "zod";

export const getDailyQuestionByDateSchema = z.object({
  date: z.string().optional(),
});
