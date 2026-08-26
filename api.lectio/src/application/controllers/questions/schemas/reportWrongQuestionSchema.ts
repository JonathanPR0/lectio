import z from "zod";

export const reportWrongQuestionSchema = z.object({
  idDailyQuestion: z.string().min(1, "'idDailyQuestion' is required"),
  idQuestion: z.number().min(0, "'id' is required"),
  reportTitle: z.string().min(1, "'reportTitle' is required"),
  reportSubject: z.string().min(1, "'reportSubject' is required"),
});

export type ReportWrongQuestionBody = z.infer<typeof reportWrongQuestionSchema>;
