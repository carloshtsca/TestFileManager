import { z } from "zod";

export const loginSchema = z
    .object({
        email: z.string().email("Invalid email address"),
        password: z.string().optional(),
    })

export type LoginFormValues = z.infer<typeof loginSchema>;