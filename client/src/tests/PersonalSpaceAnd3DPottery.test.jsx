import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage.jsx';
import { Pottery3DViewer, GLAZE_MATERIALS } from '../components/Pottery3DViewer.jsx';
import { PaintingPurchaseModal } from '../components/PaintingPurchaseModal.jsx';
import { CustomerWallBookingPage } from '../pages/customer/CustomerWallBookingPage.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import { orderApi } from '../api/orderApi.js';
import { wallBookingApi } from '../api/wallBookingApi.js';
import { profileApi } from '../api/profileApi.js';

vi.mock('../api/orderApi.js', () => ({
  orderApi: {
    createOrder: vi.fn()
  }
}));

vi.mock('../api/wallBookingApi.js', () => ({
  wallBookingApi: {
    getWallRate: vi.fn().mockResolvedValue({ ratePerSqFt: 150 }),
    getBookedDates: vi.fn().mockResolvedValue({ bookedDates: [] }),
    createBooking: vi.fn().mockResolvedValue({ message: 'Success' })
  }
}));

vi.mock('../api/profileApi.js', () => ({
  profileApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn()
  }
}));

const mockCustomerWithAddress = {
  _id: 'cust-001',
  name: 'Sricharan V',
  email: 'sricharan@example.com',
  phone: '9876543210',
  role: 'CUSTOMER',
  themePreference: 'light',
  defaultAddress: {
    fullName: 'Sricharan V',
    phone: '9876543210',
    streetAddress: 'Flat 301, Heritage Enclave, Civil Lines',
    addressLine2: 'Near Statue Circle',
    city: 'Jaipur',
    state: 'Rajasthan',
    postalCode: '302001'
  },
  createdAt: '2026-01-15T10:00:00.000Z'
};

const mockCustomerWithoutAddress = {
  _id: 'cust-002',
  name: 'Aarav Kumar',
  email: 'aarav@example.com',
  phone: '',
  role: 'CUSTOMER',
  themePreference: 'system',
  defaultAddress: null,
  createdAt: '2026-02-20T10:00:00.000Z'
};

let currentMockUser = mockCustomerWithAddress;
const mockUpdateProfile = vi.fn().mockImplementation(async (data) => {
  currentMockUser = { ...currentMockUser, ...data };
  return { user: currentMockUser };
});
const mockRefreshUser = vi.fn().mockResolvedValue(true);

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: currentMockUser,
    updateProfile: mockUpdateProfile,
    refreshUser: mockRefreshUser,
    logout: vi.fn()
  })
}));

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('PART 1 & 6: Customer Personal Space (Profile Hub)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockUser = mockCustomerWithAddress;
  });

  it('renders customer profile overview with initials avatar, email, and completeness bar', () => {
    renderWithProviders(<CustomerProfilePage />);

    // Verify initials avatar (SV for Sricharan V)
    expect(screen.getByText('SV')).toBeInTheDocument();
    expect(screen.getByText('Sricharan V')).toBeInTheDocument();
    expect(screen.getByText('sricharan@example.com')).toBeInTheDocument();
    expect(screen.getByText(/Profile Completeness/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Customer Account/i)).toBeInTheDocument();
  });

  it('displays read-only email field to preserve security and login credentials', () => {
    renderWithProviders(<CustomerProfilePage />);

    const emailInput = screen.getByLabelText(/Registered Email/i);
    expect(emailInput).toHaveValue('sricharan@example.com');
    expect(emailInput).toHaveAttribute('readonly');
  });

  it('prefills editable personal details and default address from authenticated user', () => {
    renderWithProviders(<CustomerProfilePage />);

    expect(screen.getByLabelText(/^Full Name/i)).toHaveValue('Sricharan V');
    expect(screen.getByLabelText(/^Contact Phone/i)).toHaveValue('9876543210');
    expect(screen.getByLabelText(/House \/ Flat No., Street, Area/i)).toHaveValue('Flat 301, Heritage Enclave, Civil Lines');
    expect(screen.getByLabelText(/^City \/ Town/i)).toHaveValue('Jaipur');
    expect(screen.getByLabelText(/^State/i)).toHaveValue('Rajasthan');
    expect(screen.getByLabelText(/6-Digit PIN Code/i)).toHaveValue('302001');
  });

  it('validates 6-digit Indian PIN code and rejects non-standard postal codes', async () => {
    renderWithProviders(<CustomerProfilePage />);

    const pinInput = screen.getByLabelText(/6-Digit PIN Code/i);
    fireEvent.change(pinInput, { target: { value: '012345' } }); // invalid: starts with 0

    const submitBtn = screen.getByRole('button', { name: /Save Profile & Address/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/PIN code must be a valid 6-digit Indian postal code/i)).toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('successfully saves updated address and displays confirmation banner', async () => {
    renderWithProviders(<CustomerProfilePage />);

    const cityInput = screen.getByLabelText(/^City \/ Town/i);
    fireEvent.change(cityInput, { target: { value: 'Udaipur' } });

    const submitBtn = screen.getByRole('button', { name: /Save Profile & Address/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });

    expect(await screen.findByText(/Your profile and default address were saved successfully/i)).toBeInTheDocument();
  });
});

describe('PART 3: Light & Dark Theme System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows user to switch between Light, Dark, and System themes immediately', async () => {
    renderWithProviders(<CustomerProfilePage />);

    // Select Dark theme
    const darkOption = screen.getByLabelText(/Select Dark Theme/i);
    fireEvent.click(darkOption);

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    // Select Light theme
    const lightOption = screen.getByLabelText(/Select Light Theme/i);
    fireEvent.click(lightOption);

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});

describe('PART 2: Default Address Usage in Checkout & Wall Mural Booking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockUser = mockCustomerWithAddress;
  });

  const mockPainting = {
    id: 'p-001',
    title: 'Madhubani Tree of Life',
    artist: 'Devaki Devi',
    price: 32000,
    imageUrl: 'images/p-001.jpg',
    status: 'available'
  };

  it('prefills painting purchase modal with customer saved default address and shows Saved Default badge', () => {
    renderWithProviders(
      <PaintingPurchaseModal
        isOpen={true}
        painting={mockPainting}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Flat 301, Heritage Enclave, Civil Lines')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jaipur')).toBeInTheDocument();
    expect(screen.getByDisplayValue('302001')).toBeInTheDocument();
    expect(screen.getByText(/Saved Default Address/i)).toBeInTheDocument();
  });

  it('distinguishes modified address as Order-Specific when customer edits prefilled fields', () => {
    renderWithProviders(
      <PaintingPurchaseModal
        isOpen={true}
        painting={mockPainting}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const streetInput = screen.getByLabelText(/House Number & Street Address/i);
    fireEvent.change(streetInput, { target: { value: 'New Temporary Address 123' } });

    expect(screen.getByText(/Order-Specific Address \(Modified\)/i)).toBeInTheDocument();
  });

  it('provides explicit saveAsDefault checkbox in checkout', () => {
    renderWithProviders(
      <PaintingPurchaseModal
        isOpen={true}
        painting={mockPainting}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const checkbox = screen.getByLabelText(/Save this address as my default address in Personal Space/i);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it('prefills wall mural booking form with customer saved address', () => {
    renderWithProviders(<CustomerWallBookingPage />);

    expect(screen.getByDisplayValue(/Flat 301, Heritage Enclave, Civil Lines/i)).toBeInTheDocument();
    expect(screen.getByText(/Prefilled Default Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Save this service address as my default address in Personal Space/i)).toBeInTheDocument();
  });
});

describe('PART 4: Realistic 3D Pottery Viewer', () => {
  it('provides authentic configuration for all 6 mineral glazes', () => {
    expect(GLAZE_MATERIALS['g-01'].name).toBe('Kumkum Red');
    expect(GLAZE_MATERIALS['g-02'].name).toBe('Haldi Yellow');
    expect(GLAZE_MATERIALS['g-03'].name).toBe('Mehendi Green');
    expect(GLAZE_MATERIALS['g-04'].name).toBe('Indigo Blue');
    expect(GLAZE_MATERIALS['g-05'].name).toBe('Sandalwood Beige');
    expect(GLAZE_MATERIALS['g-06'].name).toBe('Charcoal Black');

    // All glazes must have valid hex colors and physical roughness/clearcoat
    Object.values(GLAZE_MATERIALS).forEach((g) => {
      expect(g.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(g.clearcoat).toBeGreaterThanOrEqual(0.6);
      expect(g.roughness).toBeGreaterThan(0);
    });
  });

  it('renders graceful static fallback when WebGL context is unavailable in jsdom', () => {
    render(
      <Pottery3DViewer
        itemId="i-01"
        glazeId="g-01"
        itemName="Kulhad"
        glazeName="Kumkum Red"
      />
    );

    // Verifies requirement 8: graceful fallback display when WebGL is unavailable
    expect(screen.getByRole('heading', { level: 3, name: 'Kulhad' })).toBeInTheDocument();
    expect(screen.getByText(/Glaze:\s*Kumkum Red/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Interactive 3D preview is in static mode/i)
    ).toBeInTheDocument();
  });
});
