import z from "zod";

export const signUpSchema = z.object({
  username: z.string().min(1, '"name" is required'),
  email: z.string().min(1, '"email" is required').email("Invalid email"),
  password: z.string().min(8, '"password" should be at least 8 characters long'),
  points: z.number().min(0).max(60).optional(),
});

export type SignUpBody = z.infer<typeof signUpSchema>;
