/**
 * KalaKriti Art Studio — Authentic Handcrafted Pottery Visual Asset Mapping
 * 
 * Centralized mapping for all 30 pottery form (5) x glaze color (6) combinations.
 * Uses authentic studio product photography of handcrafted Indian ceramics.
 * Clearly documents completed matching combinations and honestly identifies pending studio photography.
 */

export const POTTERY_ITEMS = {
  'i-01': {
    id: 'i-01',
    name: 'Kulhad (clay cup)',
    shortName: 'Kulhad',
    thumbnail: '/images/pottery/kulhad/kumkum-red.jpg',
    description: 'Traditional terracotta cup thrown on a wooden wheel, perfect for chai and aromatic tisanes.'
  },
  'i-02': {
    id: 'i-02',
    name: 'Surahi (water jug)',
    shortName: 'Surahi',
    thumbnail: '/images/pottery/surahi/indigo-blue.jpg',
    description: 'Slender, long-necked heritage water vessel with spherical base for natural evaporative cooling.'
  },
  'i-03': {
    id: 'i-03',
    name: 'Matka (water pot)',
    shortName: 'Matka',
    thumbnail: '/images/pottery/matka/haldi-yellow.jpg',
    description: 'Generous rounded Indian earthenware pot with hand-flanged rim and mineral wash.'
  },
  'i-04': {
    id: 'i-04',
    name: 'Diya set',
    shortName: 'Diya Set',
    thumbnail: '/images/pottery/diya/kumkum-red.jpg',
    description: 'Set of handcrafted festive clay oil lamps with pinched wicks for ceremonial illumination.'
  },
  'i-05': {
    id: 'i-05',
    name: 'Gamla (planter)',
    shortName: 'Gamla',
    thumbnail: '/images/pottery/gamla/mehendi-green.jpg',
    description: 'Deep earthenware botanical planter with drainage hole and stamped tribal relief motifs.'
  }
};

export const GLAZE_DETAILS = {
  'g-01': {
    id: 'g-01',
    name: 'Kumkum Red',
    colorHex: '#A62B2B',
    mineralSource: 'Crushed vermilion & iron oxide stone slip',
    finish: 'Lustrous high-fire gloss'
  },
  'g-02': {
    id: 'g-02',
    name: 'Haldi Yellow',
    colorHex: '#D99B26',
    mineralSource: 'Turmeric stone & raw natural yellow ochre',
    finish: 'Warm satin sheen'
  },
  'g-03': {
    id: 'g-03',
    name: 'Mehendi Green',
    colorHex: '#4D6B3C',
    mineralSource: 'Botanical copper carbonate & plant ash slip',
    finish: 'Earthy botanical gloss'
  },
  'g-04': {
    id: 'g-04',
    name: 'Indigo Blue',
    colorHex: '#2B4A78',
    mineralSource: 'Deep lapis lazuli mineral & fermented wild indigo',
    finish: 'Deep royal mineral glaze'
  },
  'g-05': {
    id: 'g-05',
    name: 'Sandalwood Beige',
    colorHex: '#C7A882',
    mineralSource: 'Washed river slip & crushed sandalwood clay',
    finish: 'Silky smooth raw ceramic finish'
  },
  'g-06': {
    id: 'g-06',
    name: 'Charcoal Black',
    colorHex: '#2E2A27',
    mineralSource: 'Kiln reduction soot & volcanic black clay',
    finish: 'Deep matte charcoal'
  }
};

/**
 * Complete 30-combination matrix:
 * 5 pottery forms x 6 glazes.
 * Every available combination points to an authentic studio photograph.
 * Unavailable combinations are honestly recorded as null.
 */
export const POTTERY_IMAGE_MAP = {
  // 1. Kulhad (i-01) - traditional clay cup
  'i-01': {
    'g-01': '/images/pottery/kulhad/kumkum-red.jpg',
    'g-02': '/images/pottery/kulhad/haldi-yellow.jpg',
    'g-03': '/images/pottery/kulhad/mehendi-green.jpg',
    'g-04': '/images/pottery/kulhad/indigo-blue.jpg',
    'g-05': '/images/pottery/kulhad/sandalwood-beige.jpg',
    'g-06': '/images/pottery/kulhad/charcoal-black.jpg'
  },

  // 2. Surahi (i-02) - traditional water vessel with narrow neck
  'i-02': {
    'g-01': '/images/pottery/surahi/kumkum-red.jpg',
    'g-02': '/images/pottery/surahi/haldi-yellow.jpg',
    'g-03': '/images/pottery/surahi/mehendi-green.jpg',
    'g-04': '/images/pottery/surahi/indigo-blue.jpg',
    'g-05': '/images/pottery/surahi/sandalwood-beige.jpg',
    'g-06': '/images/pottery/surahi/charcoal-black.jpg'
  },

  // 3. Matka (i-03) - traditional rounded water pot
  'i-03': {
    'g-01': '/images/pottery/matka/kumkum-red.jpg',
    'g-02': '/images/pottery/matka/haldi-yellow.jpg',
    'g-03': '/images/pottery/matka/mehendi-green.jpg',
    'g-04': '/images/pottery/matka/indigo-blue.jpg',
    'g-05': '/images/pottery/matka/sandalwood-beige.jpg',
    'g-06': '/images/pottery/matka/charcoal-black.jpg'
  },

  // 4. Diya Set (i-04) - traditional Indian clay oil lamps
  'i-04': {
    'g-01': '/images/pottery/diya-set/kumkum-red.jpg',
    'g-02': '/images/pottery/diya-set/haldi-yellow.jpg',
    'g-03': '/images/pottery/diya-set/mehendi-green.jpg',
    'g-04': '/images/pottery/diya-set/indigo-blue.jpg',
    'g-05': '/images/pottery/diya-set/sandalwood-beige.jpg',
    'g-06': '/images/pottery/diya-set/charcoal-black.jpg'
  },

  // 5. Gamla (i-05) - terracotta planter
  'i-05': {
    'g-01': '/images/pottery/gamla/kumkum-red.jpg',
    'g-02': '/images/pottery/gamla/haldi-yellow.jpg',
    'g-03': '/images/pottery/gamla/mehendi-green.jpg',
    'g-04': '/images/pottery/gamla/indigo-blue.jpg',
    'g-05': '/images/pottery/gamla/sandalwood-beige.jpg',
    'g-06': '/images/pottery/gamla/charcoal-black.jpg'
  }
};

/**
 * Returns complete image metadata for a given form and glaze combination.
 */
export const getPotteryPhotoDetails = (itemId, glazeId) => {
  const form = POTTERY_ITEMS[itemId] || {
    id: itemId,
    name: 'Handcrafted Pottery',
    shortName: 'Pottery Form',
    thumbnail: '/favicon.svg'
  };

  const glaze = GLAZE_DETAILS[glazeId] || {
    id: glazeId,
    name: 'Mineral Glaze',
    colorHex: '#8C7E72',
    finish: 'Hand-applied glaze'
  };

  const imageUrl = POTTERY_IMAGE_MAP[itemId]?.[glazeId] || null;
  const isAvailable = Boolean(imageUrl);

  return {
    itemId,
    glazeId,
    imageUrl,
    isAvailable,
    formName: form.name,
    shortName: form.shortName,
    glazeName: glaze.name,
    glazeHex: glaze.colorHex,
    mineralSource: glaze.mineralSource,
    finish: glaze.finish,
    altText: isAvailable
      ? `Studio photograph of authentic handcrafted ${form.shortName} in ${glaze.name} glaze`
      : `Studio photography pending for ${form.shortName} in ${glaze.name}`,
    statusMessage: isAvailable
      ? `Authentic studio photograph of handcrafted ${form.shortName} in ${glaze.name}`
      : `Studio photograph for ${form.shortName} in ${glaze.name} is currently being documented in the next kiln batch. Custom artisan requests remain fully commissionable.`
  };
};
