import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CustomerWallBookingPage } from '../pages/customer/CustomerWallBookingPage.jsx';
import { AdminWallBookingsPage } from '../pages/admin/AdminWallBookingsPage.jsx';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage.jsx';
import { wallBookingApi } from '../api/wallBookingApi.js';
import * as AuthContextModule from '../context/AuthContext.jsx';

// Mock AuthContext
vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
  user: {
    _id: 'cust-123',
    name: 'Sricharan Customer',
    email: 'customer@kalakriti.in',
    role: 'CUSTOMER',
    defaultAddress: {
      fullName: 'Sricharan Customer',
      phone: '9876543210',
      streetAddress: '12 Heritage Road',
      city: 'Jaipur',
      postalCode: '302001'
    }
  },
  refreshUser: vi.fn()
});

// Mock wallBookingApi
vi.mock('../api/wallBookingApi.js', () => ({
  wallBookingApi: {
    getWallRate: vi.fn(),
    getMuralDesigns: vi.fn(),
    getBookedDates: vi.fn(),
    createBooking: vi.fn(),
    getAllBookingsAdmin: vi.fn(),
    getMuralRateAdmin: vi.fn(),
    updateMuralRateAdmin: vi.fn(),
    confirmBookingAdmin: vi.fn(),
    declineBookingAdmin: vi.fn()
  }
}));

describe('Feature 1: Selectable Wall Mural Designs & Feature 2: Admin Mural Pricing', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    wallBookingApi.getWallRate.mockResolvedValue({
      success: true,
      ratePerSqFt: 150,
      currency: 'INR'
    });

    wallBookingApi.getMuralDesigns.mockResolvedValue({
      success: true,
      designs: [
        {
          id: 'traditional-warli',
          name: 'Traditional Warli & Folk Murals',
          description: 'Ritualistic folk art featuring white rice-paste motifs.',
          previewImage: '/images/p-002.jpg'
        },
        {
          id: 'nature-botanical',
          name: 'Nature & Botanical',
          description: 'Lush flora, creeping vines, and delicate blooms.',
          previewImage: '/images/p-005.jpg'
        },
        {
          id: 'abstract-geometric',
          name: 'Abstract & Geometric',
          description: 'Modern architectural lines and rhythmic Indian symmetry.',
          previewImage: '/images/p-006.jpg'
        },
        {
          id: 'mandala-decorative',
          name: 'Mandala & Decorative Art',
          description: 'Sacred circular geometric patterns and radial symmetry.',
          previewImage: '/images/p-001.jpg'
        },
        {
          id: 'landscape-scenic',
          name: 'Landscape & Scenic Murals',
          description: 'Expansive panoramic countryside vistas.',
          previewImage: '/images/p-012.jpg'
        },
        {
          id: 'kids-room',
          name: "Kids' Room Murals",
          description: 'Playful folklore creatures and whimsical storytelling motifs.',
          previewImage: '/images/p-008.jpg'
        }
      ]
    });

    wallBookingApi.getBookedDates.mockResolvedValue({
      success: true,
      bookedDates: []
    });

    wallBookingApi.getMuralRateAdmin.mockResolvedValue({
      success: true,
      ratePerSqFt: 150,
      currency: 'INR'
    });

    wallBookingApi.getAllBookingsAdmin.mockResolvedValue({
      success: true,
      bookings: [
        {
          _id: 'booking-1',
          bookingDate: '2026-11-15',
          customer: { name: 'Priya Sharma', email: 'priya@example.com' },
          address: '42 Royal Crescent, Jaipur',
          wallSize: 100,
          appliedRate: 150,
          totalPrice: 15000,
          selectedDesign: {
            id: 'nature-botanical',
            name: 'Nature & Botanical',
            previewImage: '/images/p-005.jpg'
          },
          status: 'requested'
        }
      ]
    });
  });

  it('Feature 1: renders all 6 selectable mural designs and updates selected style upon clicking', async () => {
    render(
      <BrowserRouter>
        <CustomerWallBookingPage />
      </BrowserRouter>
    );

    // Verify all 6 designs render
    const warliElements = await screen.findAllByText(/Traditional Warli & Folk Murals/i);
    expect(warliElements.length).toBeGreaterThan(0);

    expect(screen.getByText('Nature & Botanical')).toBeInTheDocument();
    expect(screen.getByText('Abstract & Geometric')).toBeInTheDocument();
    expect(screen.getByText('Mandala & Decorative Art')).toBeInTheDocument();
    expect(screen.getByText('Landscape & Scenic Murals')).toBeInTheDocument();
    expect(screen.getByText("Kids' Room Murals")).toBeInTheDocument();

    // Select Nature & Botanical card
    const botanicalCard = screen.getByText('Nature & Botanical').closest('.card');
    fireEvent.click(botanicalCard);

    // Verify Nature & Botanical is selected in Price Breakdown
    await waitFor(() => {
      const botanicalElements = screen.getAllByText('Nature & Botanical');
      expect(botanicalElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('Feature 2: allows administrator to configure mural rate and save changes', async () => {
    wallBookingApi.updateMuralRateAdmin.mockResolvedValue({
      success: true,
      ratePerSqFt: 180,
      currency: 'INR'
    });

    render(
      <BrowserRouter>
        <AdminWallBookingsPage />
      </BrowserRouter>
    );

    // Verify Current Active Rate is displayed
    expect(await screen.findByText(/Current Active Rate:/i)).toBeInTheDocument();
    expect(screen.getByText('₹150/sq.ft')).toBeInTheDocument();

    // Verify Mural Design column displays in table
    expect(screen.getByText('Mural Design')).toBeInTheDocument();
    expect(screen.getByText('Nature & Botanical')).toBeInTheDocument();

    // Input new rate: 180
    const rateInput = screen.getByLabelText(/Configure New Rate/i);
    fireEvent.change(rateInput, { target: { value: '180' } });

    // Click Save Changes button
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(wallBookingApi.updateMuralRateAdmin).toHaveBeenCalledWith(180);
    });

    // Check success feedback message
    expect(await screen.findByText(/Mural rate updated to ₹180 per sq.ft successfully/i)).toBeInTheDocument();
  });

  it('Feature 2: renders AdminSettingsPage with rate editor and live price calculation simulator', async () => {
    render(
      <BrowserRouter>
        <AdminSettingsPage />
      </BrowserRouter>
    );

    expect(await screen.findByText('Studio Settings')).toBeInTheDocument();
    expect(screen.getByText('Live Mural Price Simulator')).toBeInTheDocument();
    expect(screen.getByLabelText(/Configure New Rate/i)).toHaveValue(150);
  });
});
