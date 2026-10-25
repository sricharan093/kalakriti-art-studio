/**
 * Normalizes artwork and pottery image URLs across both dev (Vite proxy)
 * and production builds, accommodating seeded images ('images/p-001.jpg')
 * and uploaded images ('uploads/paintings/xyz.jpg').
 */
export const getArtworkUrl = (imageUrl, fallback = '/favicon.svg') => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return fallback;
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return fallback;
  }

  // Absolute URLs or local blob URLs (for preview)
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Already prefixed with root slash
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
};

export const handleImageError = (e, fallback = '/favicon.svg') => {
  if (e?.target) {
    e.target.onerror = null;
    e.target.src = fallback;
  }
};
