import z from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(1, '"username" is required'),
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
