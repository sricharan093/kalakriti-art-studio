import { z } from 'zod';

export const createPaintingSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string({ required_error: 'Title is required' }).trim().min(2, 'Title must be at least 2 characters'),
  artist: z.string({ required_error: 'Artist is required' }).trim().min(2, 'Artist must be at least 2 characters'),
  description: z.string().trim().default(''),
  price: z.coerce.number({ required_error: 'Price is required' }).positive('Price must be greater than zero'),
  imageUrl: z.string({ required_error: 'Image URL is required' }).trim().min(1, 'Image URL cannot be empty'),
  category: z.string().trim().optional().default(''),
  dimensions: z.string().trim().optional().default(''),
  medium: z.string().trim().optional().default(''),
  status: z.enum(['available', 'sold', 'archived']).optional().default('available')
});

export const updatePaintingSchema = z.object({
  title: z.string().trim().min(2).optional(),
  artist: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
  price: z.coerce.number().positive().optional(),
  imageUrl: z.string().trim().min(1).optional(),
  category: z.string().trim().optional(),
  dimensions: z.string().trim().optional(),
  medium: z.string().trim().optional(),
  status: z.enum(['available', 'sold', 'archived']).optional(),
  isArchived: z.boolean().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});
