import { z } from "zod";

export const completeProfileSchema = z.object({
  fullName: z
    .string("Full name is required")
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .max(255, "Email must be at most 255 characters")
    .pipe(z.email("Valid email is required")),
});

export type CompleteProfileInput = z.infer<
  typeof completeProfileSchema
>;
