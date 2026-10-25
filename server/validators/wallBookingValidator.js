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

export const SUPPORTED_MURAL_DESIGNS = [
  {
    id: 'traditional-warli',
    name: 'Traditional Warli & Folk Murals',
    description: 'Ritualistic folk art featuring white rice-paste motifs of dancing circles, harvest ceremonies, and tribal life.',
    previewImage: '/images/p-002.jpg'
  },
  {
    id: 'nature-botanical',
    name: 'Nature & Botanical',
    description: 'Lush flora, creeping vines, and delicate blooms rendered with earthy mineral tones to bring the outdoors in.',
    previewImage: '/images/p-005.jpg'
  },
  {
    id: 'abstract-geometric',
    name: 'Abstract & Geometric',
    description: 'Modern architectural lines, rhythmic Indian symmetry, and balanced polychromatic shapes.',
    previewImage: '/images/p-006.jpg'
  },
  {
    id: 'mandala-decorative',
    name: 'Mandala & Decorative Art',
    description: 'Sacred circular geometric patterns, meditative radial symmetry, and intricate celebratory borders.',
    previewImage: '/images/p-001.jpg'
  },
  {
    id: 'landscape-scenic',
    name: 'Landscape & Scenic Murals',
    description: 'Expansive panoramic countryside vistas, monsoon skies, riverbanks, and serene village horizons.',
    previewImage: '/images/p-012.jpg'
  },
  {
    id: 'kids-room',
    name: "Kids' Room Murals",
    description: 'Playful folklore creatures, whimsical elephants, stars, and colorful storytelling motifs for children.',
    previewImage: '/images/p-008.jpg'
  }
];

export const SUPPORTED_DESIGN_IDS = SUPPORTED_MURAL_DESIGNS.map((d) => d.id);

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
    .min(5, 'Address must be at least 5 characters long'),
  designId: z.string().optional().refine(
    (id) => !id || SUPPORTED_DESIGN_IDS.includes(id),
    {
      message: 'Invalid or unsupported mural design selected'
    }
  )
});

export const updateMuralRateSchema = z.object({
  rate: z.number({ required_error: 'Mural rate is required', invalid_type_error: 'Mural rate must be a valid number' })
    .min(10, 'Mural rate must be at least ₹10 per sq ft')
    .max(10000, 'Mural rate cannot exceed ₹10,000 per sq ft')
});

