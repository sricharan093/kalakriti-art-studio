import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PaintingPurchaseModal } from '../components/PaintingPurchaseModal.jsx';
import { AdminWallBookingsPage } from '../pages/admin/AdminWallBookingsPage.jsx';
import { wallBookingApi } from '../api/wallBookingApi.js';
import { orderApi } from '../api/orderApi.js';

vi.mock('../api/wallBookingApi.js', () => ({
  wallBookingApi: {
    getAllBookingsAdmin: vi.fn(),
    confirmBookingAdmin: vi.fn(),
    declineBookingAdmin: vi.fn()
  }
}));

vi.mock('../api/orderApi.js', () => ({
  orderApi: {
    createOrder: vi.fn()
  }
}));

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    refreshUser: vi.fn(),
    logout: vi.fn()
  }))
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

const mockPainting = {
  id: 'P-101',
  title: 'Royal Bengal Roar',
  artist: 'Shambhu Das',
  price: 24500,
  imageUrl: 'images/p-001.jpg',
  status: 'available'
};

const mockWallBookings = [
  {
    _id: 'wb-001',
    customer: { name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9876543210' },
    bookingDate: '2026-11-20T00:00:00.000Z',
    wallDimensions: { lengthFt: 15, heightFt: 10, totalSqFt: 150 },
    address: 'Flat 402, Lotus Towers, Indiranagar, Bengaluru, Karnataka - 560038',
    totalPrice: 105000,
    status: 'requested',
    createdAt: '2026-10-24T10:00:00.000Z'
  }
];

describe('Feature 1: Painting Purchase Flow with Delivery Address', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with painting preview, pricing, and all 7 delivery address fields', () => {
    renderWithRouter(
      <PaintingPurchaseModal
        isOpen={true}
        painting={mockPainting}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText('Complete Painting Acquisition')).toBeInTheDocument();
    expect(screen.getByText('Royal Bengal Roar')).toBeInTheDocument();
    expect(screen.getAllByText(/24,500/).length).toBeGreaterThan(0);

    expect(screen.getByLabelText(/Recipient Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apartment, Landmark/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^State/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PIN Code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm Purchase/i })).toBeInTheDocument();
  });

  it('rejects missing required delivery fields and displays inline validation errors', async () => {
    const { container } = renderWithRouter(
      <PaintingPurchaseModal
        isOpen={true}
        painting={mockPainting}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const form = container.querySelector('form');
    fireEvent.submit(form);

    expect(await screen.findByText(/Recipient's full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Indian mobile number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/House number and street address are required/i)).toBeInTheDocument();
    expect(screen.getByText(/^City is required/i)).toBeInTheDocument();
    expect(screen.getByText(/^State is required/i)).toBeInTheDocument();
    expect(screen.getByText(/PIN code is required/i)).toBeInTheDocument();
    expect(orderApi.createOrder).not.toHaveBeenCalled();
  });

  it('validates and rejects invalid Indian phone number format', async () => {
    renderWithRouter(
      <PaintingPurchaseModal
        isOpen={true}
        painting={mockPainting}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/Recipient Full Name/i), { target: { value: 'Priya Sharma' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '1234567890' } }); // doesn't start with 6-9
    fireEvent.change(screen.getByLabelText(/Street Address/i), { target: { value: '45 MG Road' } });
    fireEvent.change(screen.getByLabelText(/^City/i), { target: { value: 'Bengaluru' } });
    fireEvent.change(screen.getByLabelText(/^State/i), { target: { value: 'Karnataka' } });
    fireEvent.change(screen.getByLabelText(/PIN Code/i), { target: { value: '560001' } });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));

    expect(await screen.findByText(/Please enter a valid 10-digit Indian mobile number/i)).toBeInTheDocument();
    expect(orderApi.createOrder).not.toHaveBeenCalled();
  });

  it('validates and rejects invalid Indian postal PIN code format', async () => {
    renderWithRouter(
      <PaintingPurchaseModal
        isOpen={true}
        painting={mockPainting}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/Recipient Full Name/i), { target: { value: 'Priya Sharma' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/Street Address/i), { target: { value: '45 MG Road' } });
    fireEvent.change(screen.getByLabelText(/^City/i), { target: { value: 'Bengaluru' } });
    fireEvent.change(screen.getByLabelText(/^State/i), { target: { value: 'Karnataka' } });
    fireEvent.change(screen.getByLabelText(/PIN Code/i), { target: { value: '012345' } }); // invalid: starts with 0

    fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));

    expect(await screen.findByText(/Please enter a valid 6-digit Indian PIN code/i)).toBeInTheDocument();
    expect(orderApi.createOrder).not.toHaveBeenCalled();
  });

  it('submits valid delivery address snapshot and triggers onSuccess', async () => {
    const onSuccessMock = vi.fn();
    orderApi.createOrder.mockResolvedValueOnce({
      order: {
        _id: 'ord-123',
        paintingId: 'P-101',
        price: 24500,
        status: 'placed',
        deliveryAddress: {
          fullName: 'Priya Sharma',
          phone: '9876543210',
          streetAddress: '45 MG Road',
          addressLine2: 'Apt 302',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001'
        }
      }
    });

    renderWithRouter(
      <PaintingPurchaseModal
        isOpen={true}
        painting={mockPainting}
        onClose={vi.fn()}
        onSuccess={onSuccessMock}
      />
    );

    fireEvent.change(screen.getByLabelText(/Recipient Full Name/i), { target: { value: 'Priya Sharma' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/Street Address/i), { target: { value: '45 MG Road' } });
    fireEvent.change(screen.getByLabelText(/Apartment, Landmark/i), { target: { value: 'Apt 302' } });
    fireEvent.change(screen.getByLabelText(/^City/i), { target: { value: 'Bengaluru' } });
    fireEvent.change(screen.getByLabelText(/^State/i), { target: { value: 'Karnataka' } });
    fireEvent.change(screen.getByLabelText(/PIN Code/i), { target: { value: '560001' } });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));

    await waitFor(() => {
      expect(orderApi.createOrder).toHaveBeenCalledWith('P-101', {
        fullName: 'Priya Sharma',
        phone: '9876543210',
        streetAddress: '45 MG Road',
        addressLine2: 'Apt 302',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001'
      });
    });

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    }, { timeout: 2500 });
  });
});

describe('Feature 2: Confirmation Dialogs for Admin Wall Mural Decisions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    wallBookingApi.getAllBookingsAdmin.mockResolvedValue({ bookings: mockWallBookings });
  });

  it('renders Confirm and Decline buttons only for requested bookings', async () => {
    render(
      <BrowserRouter>
        <AdminWallBookingsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    expect(screen.getByTitle('Confirm Booking')).toBeInTheDocument();
    expect(screen.getByTitle('Decline Booking')).toBeInTheDocument();
  });

  it('clicking Confirm opens confirmation dialog without immediately sending API request', async () => {
    render(
      <BrowserRouter>
        <AdminWallBookingsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Confirm Booking'));

    // Verify dialog content is shown
    expect(screen.getByText('Confirm wall mural booking?')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to confirm this wall mural booking/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Flat 402, Lotus Towers/i).length).toBeGreaterThan(0);

    // Confirm that no API call was sent on simply opening dialog
    expect(wallBookingApi.confirmBookingAdmin).not.toHaveBeenCalled();
    expect(wallBookingApi.declineBookingAdmin).not.toHaveBeenCalled();
  });

  it('cancelling Confirm dialog closes it without calling API', async () => {
    render(
      <BrowserRouter>
        <AdminWallBookingsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Confirm Booking'));
    expect(screen.getByText('Confirm wall mural booking?')).toBeInTheDocument();

    // Click Cancel
    fireEvent.click(screen.getByRole('button', { name: /^Cancel$/i }));

    await waitFor(() => {
      expect(screen.queryByText('Confirm wall mural booking?')).not.toBeInTheDocument();
    });

    expect(wallBookingApi.confirmBookingAdmin).not.toHaveBeenCalled();
  });

  it('explicitly clicking Confirm Booking in dialog calls confirmBookingAdmin exactly once', async () => {
    wallBookingApi.confirmBookingAdmin.mockResolvedValueOnce({
      booking: { ...mockWallBookings[0], status: 'confirmed' }
    });

    render(
      <BrowserRouter>
        <AdminWallBookingsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Confirm Booking'));
    fireEvent.click(screen.getByRole('button', { name: /^Confirm Booking$/ }));

    await waitFor(() => {
      expect(wallBookingApi.confirmBookingAdmin).toHaveBeenCalledTimes(1);
      expect(wallBookingApi.confirmBookingAdmin).toHaveBeenCalledWith('wb-001');
    });
  });

  it('clicking Decline opens decline dialog with Keep Booking and Decline Booking options', async () => {
    render(
      <BrowserRouter>
        <AdminWallBookingsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Decline Booking'));

    expect(screen.getByText('Decline wall mural booking?')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to decline this booking/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Keep Booking$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Decline Booking$/ })).toBeInTheDocument();

    // Verify no API call yet
    expect(wallBookingApi.declineBookingAdmin).not.toHaveBeenCalled();
  });

  it('cancelling Decline dialog with Keep Booking does not call decline API', async () => {
    render(
      <BrowserRouter>
        <AdminWallBookingsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Decline Booking'));
    fireEvent.click(screen.getByRole('button', { name: /^Keep Booking$/ }));

    await waitFor(() => {
      expect(screen.queryByText('Decline wall mural booking?')).not.toBeInTheDocument();
    });

    expect(wallBookingApi.declineBookingAdmin).not.toHaveBeenCalled();
  });

  it('explicitly confirming Decline sends exactly one API request', async () => {
    wallBookingApi.declineBookingAdmin.mockResolvedValueOnce({
      booking: { ...mockWallBookings[0], status: 'declined' }
    });

    render(
      <BrowserRouter>
        <AdminWallBookingsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Decline Booking'));
    fireEvent.click(screen.getByRole('button', { name: /^Decline Booking$/ }));

    await waitFor(() => {
      expect(wallBookingApi.declineBookingAdmin).toHaveBeenCalledTimes(1);
      expect(wallBookingApi.declineBookingAdmin).toHaveBeenCalledWith('wb-001');
    });
  });
});
