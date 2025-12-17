import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const registerSchema = z
    .object({
        firstname: z.string().min(1, "First name is required"),
        lastname: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        phone: z
            .string()
            .refine((value) => isValidPhoneNumber(value), { message: "Invalid phone number" }),

        country: z.string().optional(),

        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmpassword"],
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;