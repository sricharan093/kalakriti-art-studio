import { z } from 'zod';
import { getDaysFromToday } from './wallBookingValidator.js';

export const createPotterySchema = z.object({
  itemId: z.string({ required_error: 'Pottery item is required' }).trim().min(1, 'Please select a pottery item'),
  glazeId: z.string({ required_error: 'Glaze is required' }).trim().min(1, 'Please select a glaze'),
  quantity: z.number({ required_error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(12, 'Quantity cannot exceed 12'),
  neededByDate: z.string({ required_error: 'Needed-by date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((dateStr) => {
      const days = getDaysFromToday(dateStr);
      return days >= 14;
    }, {
      message: 'Needed-by date must be at least 14 days from today'
    }),
  notes: z.string().trim().optional().default('')
});

export const updatePotterySchema = z.object({
  itemId: z.string().trim().min(1).optional(),
  glazeId: z.string().trim().min(1).optional(),
  quantity: z.number().int().min(1).max(12).optional(),
  neededByDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((dateStr) => {
      const days = getDaysFromToday(dateStr);
      return days >= 14;
    }, {
      message: 'Needed-by date must be at least 14 days from today'
    })
    .optional(),
  notes: z.string().trim().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});
