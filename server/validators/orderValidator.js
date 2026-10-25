import { z } from 'zod';

export const INDIAN_MOBILE_REGEX = /^(?:\+91[\-\s]?)?[0]?[6-9]\d{9}$/;
const indianMobileRegex = INDIAN_MOBILE_REGEX;

// 6-digit Indian PIN code (first digit 1-9)
export const INDIAN_PIN_REGEX = /^[1-9][0-9]{5}$/;
const indianPinRegex = INDIAN_PIN_REGEX;

export const deliveryAddressSchema = z.object({
  fullName: z.string({ required_error: "Recipient's full name is required" })
    .trim()
    .min(2, "Recipient's full name must be at least 2 characters long"),
  phone: z.string({ required_error: 'Indian mobile number is required' })
    .trim()
    .refine((val) => indianMobileRegex.test(val.replace(/[\s\-]/g, '')), {
      message: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'
    })
    .transform((val) => {
      // Normalize to 10-digit mobile number
      const cleaned = val.replace(/[\s\-\(\)]/g, '');
      const match = cleaned.match(/([6-9]\d{9})$/);
      return match ? match[1] : cleaned;
    }),
  streetAddress: z.string({ required_error: 'House number and street address are required' })
    .trim()
    .min(3, 'House number and street address must be at least 3 characters long'),
  addressLine2: z.string().trim().optional().default(''),
  city: z.string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City must be at least 2 characters long'),
  state: z.string({ required_error: 'State is required' })
    .trim()
    .min(2, 'State must be at least 2 characters long'),
  postalCode: z.string({ required_error: 'Six-digit PIN code is required' })
    .trim()
    .transform((val) => val.replace(/\s/g, ''))
    .refine((val) => indianPinRegex.test(val), {
      message: 'Please enter a valid 6-digit Indian PIN code (e.g. 302001)'
    })
});

export const normalizeDeliveryAddressInput = (raw = {}) => {
  return {
    fullName: raw.fullName ?? raw.recipientName ?? '',
    phone: raw.phone ?? raw.mobile ?? raw.phoneNumber ?? '',
    streetAddress: raw.streetAddress ?? raw.address ?? raw.addressLine1 ?? '',
    addressLine2: raw.addressLine2 ?? raw.landmark ?? raw.apartment ?? '',
    city: raw.city ?? '',
    state: raw.state ?? '',
    postalCode: raw.postalCode ?? raw.pinCode ?? raw.pincode ?? ''
  };
};

export const createOrderSchema = z.object({
  paintingId: z.string({ required_error: 'Painting identifier is required' })
    .trim()
    .min(1, 'Painting identifier is required'),
  deliveryAddress: deliveryAddressSchema
});
