import z from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email().min(1, '"email" is required'),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
