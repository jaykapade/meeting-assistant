import { z } from "zod";

export const meetingFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  description: z
    .union([
      z.string().max(2000, "Description must be less than 2000 characters"),
      z.literal(""),
    ])
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  meeting_url: z
    .union([z.string().url("Please enter a valid URL"), z.literal("")])
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  meeting_platform: z
    .union([
      z.string().max(100, "Platform name must be less than 100 characters"),
      z.literal(""),
    ])
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  scheduled_at: z.date().nullable().optional(),
});

export type MeetingFormData = z.infer<typeof meetingFormSchema>;
