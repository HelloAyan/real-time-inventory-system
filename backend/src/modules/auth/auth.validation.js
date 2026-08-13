import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name must be at most 30 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  password: z.string().min(1, "Password is required"),
});
