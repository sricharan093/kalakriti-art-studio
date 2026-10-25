import { z } from 'zod';

export const getDaysFromToday = (dateStr) => {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return -1;
  const [year, month, day] = parts;
  const targetUtc = Date.UTC(year, month - 1, day);
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = targetUtc - todayUtc;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const createWallBookingSchema = z.object({
  bookingDate: z.string({ required_error: 'Booking date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((dateStr) => {
      const days = getDaysFromToday(dateStr);
      return days >= 7;
    }, {
      message: 'Booking date must be at least 7 days from today'
    })
    .refine((dateStr) => {
      const days = getDaysFromToday(dateStr);
      return days <= 90;
    }, {
      message: 'Booking date cannot be more than 90 days from today'
    }),
  wallSize: z.number({ required_error: 'Wall size is required' })
    .min(10, 'Wall size must be at least 10 square feet')
    .max(500, 'Wall size cannot exceed 500 square feet'),
  address: z.string({ required_error: 'Address is required' })
    .trim()
    .min(5, 'Address must be at least 5 characters long')
});
