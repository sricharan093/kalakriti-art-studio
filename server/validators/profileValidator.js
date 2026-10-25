import { z } from 'zod';
import { INDIAN_MOBILE_REGEX, INDIAN_PIN_REGEX, deliveryAddressSchema } from './orderValidator.js';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').optional(),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        const normalized = val.replace(/[\s\-]/g, '');
        return INDIAN_MOBILE_REGEX.test(normalized);
      },
      { message: 'Phone must be a valid 10-digit Indian mobile number starting with 6-9.' }
    )
    .optional(),
  themePreference: z.enum(['light', 'dark', 'system']).optional(),
  defaultAddress: deliveryAddressSchema.nullable().optional()
});

export const normalizeProfileInput = (data) => {
  const normalized = {};

  if (typeof data.name === 'string') {
    normalized.name = data.name.trim();
  }

  if (typeof data.phone === 'string') {
    const raw = data.phone.trim().replace(/[\s\-]/g, '');
    if (raw.length === 0) {
      normalized.phone = '';
    } else {
      const match = raw.match(/^(?:\+91[\-\s]?)?[0]?([6-9]\d{9})$/);
      normalized.phone = match ? match[1] : raw;
    }
  }

  if (data.themePreference && ['light', 'dark', 'system'].includes(data.themePreference)) {
    normalized.themePreference = data.themePreference;
  }

  if (data.defaultAddress === null) {
    normalized.defaultAddress = null;
  } else if (data.defaultAddress && typeof data.defaultAddress === 'object') {
    const addr = data.defaultAddress;
    const phoneRaw = typeof addr.phone === 'string' ? addr.phone.trim().replace(/[\s\-]/g, '') : '';
    const phoneMatch = phoneRaw.match(/^(?:\+91[\-\s]?)?[0]?([6-9]\d{9})$/);

    normalized.defaultAddress = {
      fullName: typeof addr.fullName === 'string' ? addr.fullName.trim() : '',
      phone: phoneMatch ? phoneMatch[1] : phoneRaw,
      streetAddress: typeof addr.streetAddress === 'string' ? addr.streetAddress.trim() : '',
      addressLine2: typeof addr.addressLine2 === 'string' ? addr.addressLine2.trim() : '',
      city: typeof addr.city === 'string' ? addr.city.trim() : '',
      state: typeof addr.state === 'string' ? addr.state.trim() : '',
      postalCode: typeof addr.postalCode === 'string' ? addr.postalCode.trim().replace(/\s/g, '') : ''
    };
  }

  return normalized;
};
