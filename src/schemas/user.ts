import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const userSchema = z
    .object({
        avatar: z.string().nullable(),
        firstname: z.string().min(1, "First name is required"),
        lastname: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        phone: z
            .string()
            .refine((value) => isValidPhoneNumber(value), { message: "Invalid phone number" }),

        country: z.string().optional(),
    })

export type UserFormValues = z.infer<typeof userSchema>;