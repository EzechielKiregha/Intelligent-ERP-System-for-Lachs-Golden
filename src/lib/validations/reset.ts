import { z } from 'zod';

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Invalid or missing token"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: "Passwords do not match",
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
