import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  createdAt: z.string(),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type User = z.infer<typeof UserResponseSchema>;
