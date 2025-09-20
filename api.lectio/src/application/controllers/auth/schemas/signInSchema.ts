import z from "zod";

export const signInSchema = z.object({
  email: z.string().email().min(1, '"email" is required'),
  password: z.string().min(8, '"password" should be at least 8 characters long'),
  points: z.number().min(0).max(60).optional(),
});

export type SignInBody = z.infer<typeof signInSchema>;
