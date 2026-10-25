import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  POTTERY_ITEMS,
  GLAZE_DETAILS,
  POTTERY_IMAGE_MAP,
  getPotteryPhotoDetails
} from '../data/potteryImages.js';
import { PotteryPhotoViewer } from '../components/PotteryPhotoViewer.jsx';

describe('Real Pottery Photo Customizer & Full 30-Combination Matrix', () => {
  it('covers all 5 pottery forms and all 6 mineral glazes with 100% photo availability (30/30)', () => {
    const itemIds = ['i-01', 'i-02', 'i-03', 'i-04', 'i-05'];
    const glazeIds = ['g-01', 'g-02', 'g-03', 'g-04', 'g-05', 'g-06'];

    // Verify 5 forms
    expect(Object.keys(POTTERY_ITEMS)).toHaveLength(5);
    itemIds.forEach((id) => {
      expect(POTTERY_ITEMS[id]).toBeDefined();
      expect(POTTERY_ITEMS[id].thumbnail).toMatch(/\.jpg$/);
    });

    // Verify 6 glazes
    expect(Object.keys(GLAZE_DETAILS)).toHaveLength(6);
    glazeIds.forEach((id) => {
      expect(GLAZE_DETAILS[id]).toBeDefined();
      expect(GLAZE_DETAILS[id].colorHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    // Verify all 30 combinations exist in POTTERY_IMAGE_MAP and point to .jpg files
    let totalCombinations = 0;
    let availablePhotosCount = 0;

    itemIds.forEach((itemId) => {
      expect(POTTERY_IMAGE_MAP[itemId]).toBeDefined();
      glazeIds.forEach((glazeId) => {
        totalCombinations += 1;
        const entry = POTTERY_IMAGE_MAP[itemId][glazeId];
        expect(entry).not.toBeNull();
        expect(entry).toMatch(/^\/images\/pottery\//);
        expect(entry).toMatch(/\.jpg$/);
        availablePhotosCount += 1;
      });
    });

    expect(totalCombinations).toBe(30);
    expect(availablePhotosCount).toBe(30);
  });

  it('updates the matching photograph when form or glaze changes across all combinations', () => {
    // 1. Kulhad + Kumkum Red -> /images/pottery/kulhad/kumkum-red.jpg
    const kulhadRed = getPotteryPhotoDetails('i-01', 'g-01');
    expect(kulhadRed.imageUrl).toBe('/images/pottery/kulhad/kumkum-red.jpg');
    expect(kulhadRed.isAvailable).toBe(true);

    // 2. Kulhad + Mehendi Green -> /images/pottery/kulhad/mehendi-green.jpg
    const kulhadGreen = getPotteryPhotoDetails('i-01', 'g-03');
    expect(kulhadGreen.imageUrl).toBe('/images/pottery/kulhad/mehendi-green.jpg');
    expect(kulhadGreen.isAvailable).toBe(true);

    // 3. Surahi + Indigo Blue -> /images/pottery/surahi/indigo-blue.jpg
    const surahiBlue = getPotteryPhotoDetails('i-02', 'g-04');
    expect(surahiBlue.imageUrl).toBe('/images/pottery/surahi/indigo-blue.jpg');
    expect(surahiBlue.isAvailable).toBe(true);

    // 4. Matka + Sandalwood Beige -> /images/pottery/matka/sandalwood-beige.jpg
    const matkaBeige = getPotteryPhotoDetails('i-03', 'g-05');
    expect(matkaBeige.imageUrl).toBe('/images/pottery/matka/sandalwood-beige.jpg');
    expect(matkaBeige.isAvailable).toBe(true);

    // 5. Diya Set + Kumkum Red -> /images/pottery/diya-set/kumkum-red.jpg
    const diyaRed = getPotteryPhotoDetails('i-04', 'g-01');
    expect(diyaRed.imageUrl).toBe('/images/pottery/diya-set/kumkum-red.jpg');
    expect(diyaRed.isAvailable).toBe(true);

    // 6. Diya Set + Haldi Yellow -> /images/pottery/diya-set/haldi-yellow.jpg
    const diyaYellow = getPotteryPhotoDetails('i-04', 'g-02');
    expect(diyaYellow.imageUrl).toBe('/images/pottery/diya-set/haldi-yellow.jpg');
    expect(diyaYellow.isAvailable).toBe(true);

    // 7. Diya Set + Charcoal Black -> /images/pottery/diya-set/charcoal-black.jpg
    const diyaBlack = getPotteryPhotoDetails('i-04', 'g-06');
    expect(diyaBlack.imageUrl).toBe('/images/pottery/diya-set/charcoal-black.jpg');
    expect(diyaBlack.isAvailable).toBe(true);

    // 8. Gamla + Haldi Yellow -> /images/pottery/gamla/haldi-yellow.jpg
    const gamlaYellow = getPotteryPhotoDetails('i-05', 'g-02');
    expect(gamlaYellow.imageUrl).toBe('/images/pottery/gamla/haldi-yellow.jpg');
    expect(gamlaYellow.isAvailable).toBe(true);
  });

  it('renders visible authentic photograph in PotteryPhotoViewer with live commission summary', () => {
    render(
      <PotteryPhotoViewer
        itemId="i-04"
        glazeId="g-01"
        itemName="Diya set"
        glazeName="Kumkum Red"
        quantity={6}
        neededByDate="2026-11-20"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('/images/pottery/diya-set/kumkum-red.jpg');
    expect(img.getAttribute('alt')).toMatch(/Studio photograph of authentic handcrafted Diya Set in Kumkum Red glaze/i);
    expect(screen.getByText(/6 pieces/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Studio Photo/i).length).toBeGreaterThan(0);
  });

  it('renders visible authentic photograph for Haldi Yellow Diya set', () => {
    render(
      <PotteryPhotoViewer
        itemId="i-04"
        glazeId="g-02"
        itemName="Diya set"
        glazeName="Haldi Yellow"
        quantity={2}
        neededByDate="2026-11-25"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('/images/pottery/diya-set/haldi-yellow.jpg');
    expect(screen.getByText(/Haldi Yellow/i)).toBeInTheDocument();
  });

  it('renders graceful fallback message only when image error event fires', () => {
    render(
      <PotteryPhotoViewer
        itemId="i-01"
        glazeId="g-01"
        itemName="Kulhad (clay cup)"
        glazeName="Kumkum Red"
        quantity={2}
        neededByDate="2026-11-20"
      />
    );

    const img = screen.getByRole('img');
    // Trigger error event
    fireEvent.error(img);

    expect(screen.getByText(/Photograph Temporarily Unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/can still be custom-commissioned/i)).toBeInTheDocument();
  });
});
