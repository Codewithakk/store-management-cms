import { z } from "zod";

export const reportQuerySchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid startDate'
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid endDate'
    }),
  limit: z
    .string()
    .optional()
    .default('50')
    .transform(Number)
    .refine((val) => val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100'
    }),
  offset: z
    .string()
    .optional()
    .default('0')
    .transform(Number)
    .refine((val) => val >= 0, {
      message: 'Offset must be non-negative'
    })
})