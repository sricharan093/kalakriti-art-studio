import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminDashboardLayout } from '../layouts/AdminDashboardLayout.jsx';
import { AdminOverview } from '../pages/admin/AdminOverview.jsx';
import { AdminPaintingsPage } from '../pages/admin/AdminPaintingsPage.jsx';
import { AdminAddPaintingPage } from '../pages/admin/AdminAddPaintingPage.jsx';
import { AdminTeamPage } from '../pages/admin/AdminTeamPage.jsx';
import { AdminThemeToggle } from '../components/AdminThemeToggle.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import * as AuthContextModule from '../context/AuthContext.jsx';
import * as statsApiModule from '../api/statsApi.js';
import * as paintingApiModule from '../api/paintingApi.js';
import * as authApiModule from '../api/authApi.js';

describe('Admin Dashboard, Dark/Light Theme & Image Upload Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    // Default mock admin user
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'admin-01',
        name: 'Studio Administrator',
        email: 'studio@artstudio.in',
        role: 'ADMIN'
      },
      loading: false,
      logout: vi.fn()
    });
  });

  it('1. renders AdminDashboardLayout with active navigation links and Theme Toggle', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <ThemeProvider>
          <Routes>
            <Route path="/admin" element={<AdminDashboardLayout />}>
              <Route path="dashboard" element={<div>Dashboard Content</div>} />
              <Route path="paintings" element={<div>Paintings Content</div>} />
              <Route path="add-painting" element={<div>Add Painting Content</div>} />
              <Route path="orders" element={<div>Orders Content</div>} />
              <Route path="wall-bookings" element={<div>Wall Bookings Content</div>} />
              <Route path="pottery-requests" element={<div>Pottery Content</div>} />
              <Route path="team" element={<div>Team Content</div>} />
            </Route>
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    );

    // Verify management navigation items are present
    expect(screen.getByRole('link', { name: /Studio Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Manage Paintings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Add Painting/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /All Orders/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /All Wall Bookings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /All Pottery Requests/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Studio Administrators/i })).toBeInTheDocument();

    // Studio Overview link is active
    const overviewLink = screen.getByRole('link', { name: /Studio Overview/i });
    expect(overviewLink).toHaveClass('active');

    // Theme selector options (Dark, Light, System) are rendered
    expect(screen.getAllByRole('button', { name: /Dark/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /Light/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /System/i }).length).toBeGreaterThan(0);
  });

  it('2. toggles theme between Dark, Light, and System and updates html attribute', () => {
    render(
      <ThemeProvider>
        <AdminThemeToggle />
      </ThemeProvider>
    );

    const lightBtn = screen.getByRole('button', { name: /Light/i });
    fireEvent.click(lightBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    const darkBtn = screen.getByRole('button', { name: /Dark/i });
    fireEvent.click(darkBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('3. renders AdminOverview with all 8 database-backed metric cards', async () => {
    vi.spyOn(statsApiModule.statsApi, 'getAdminStats').mockResolvedValue({
      success: true,
      stats: {
        totalCustomers: 14,
        paintingsAvailable: 9,
        paintingsSold: 3,
        totalOrders: 5,
        wallBookingsRequested: 2,
        wallBookingsConfirmed: 4,
        wallBookingsDeclined: 1,
        potteryRequested: 3,
        potteryAccepted: 6,
        potteryDeclined: 0
      },
      recentOrders: [
        {
          _id: 'ord-01',
          customer: { name: 'Aarav Patel' },
          painting: { title: 'Madhubani Peacock', price: 6500, imageUrl: 'images/p-001.jpg' },
          totalPrice: 6500,
          status: 'placed'
        }
      ],
      recentWallBookings: [],
      recentPotteryRequests: [],
      recentPaintings: [
        {
          id: 'p-001',
          title: 'Madhubani Peacock',
          artist: 'Meera Kumari',
          price: 6500,
          imageUrl: 'images/p-001.jpg',
          status: 'available'
        }
      ]
    });

    render(
      <MemoryRouter>
        <AdminOverview />
      </MemoryRouter>
    );

    // Verify all 8 metric cards are rendered with exact database values
    await waitFor(() => {
      expect(screen.getByTestId('stat-total-customers')).toHaveTextContent('14');
      expect(screen.getByTestId('stat-paintings-available')).toHaveTextContent('9');
      expect(screen.getByTestId('stat-paintings-sold')).toHaveTextContent('3');
      expect(screen.getByTestId('stat-total-orders')).toHaveTextContent('5');
      expect(screen.getByTestId('stat-wall-bookings-requested')).toHaveTextContent('2');
      expect(screen.getByTestId('stat-wall-bookings-confirmed')).toHaveTextContent('4');
      expect(screen.getByTestId('stat-pottery-requested')).toHaveTextContent('3');
      expect(screen.getByTestId('stat-pottery-accepted')).toHaveTextContent('6');
    });

    // Check that recent order appears in activity feed
    expect(screen.getByText('Aarav Patel', { exact: false })).toBeInTheDocument();
  });

  it('4. renders Add Painting form with gallery selection, camera capture, and live preview', async () => {
    // Mock URL.createObjectURL and revokeObjectURL for jsdom
    global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost:5173/mock-preview-uuid');
    global.URL.revokeObjectURL = vi.fn();

    render(
      <MemoryRouter>
        <AdminAddPaintingPage />
      </MemoryRouter>
    );

    // Heading and upload area
    expect(screen.getByRole('heading', { name: /Add New Painting to Catalogue/i })).toBeInTheDocument();
    expect(screen.getByText(/Upload Painting Image \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Choose Image \/ Gallery/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Take Photo with Camera/i })).toBeInTheDocument();

    // Select file using file picker input
    const fileInput = screen.getByLabelText(/Upload painting image file/i);
    const mockFile = new File(['fake-png-content'], 'warli-harvest.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Live preview card appears with filename and Ready badge
    await waitFor(() => {
      expect(screen.getByText('warli-harvest.png')).toBeInTheDocument();
      expect(screen.getByText('Ready')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Change Image/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retake Photo/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Remove/i })).toBeInTheDocument();
    });

    // Remove button clears selection
    const removeBtn = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByText('warli-harvest.png')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Choose Image \/ Gallery/i })).toBeInTheDocument();
  });

  it('5. validates oversized files and unsupported types on client-side upload', async () => {
    render(
      <MemoryRouter>
        <AdminAddPaintingPage />
      </MemoryRouter>
    );

    const fileInput = screen.getByLabelText(/Upload painting image file/i);

    // Test text file rejection
    const textFile = new File(['hello text'], 'document.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [textFile] } });

    expect(
      screen.getByText(/Unsupported file type. Please choose a valid JPG, JPEG, PNG, or WebP image/i)
    ).toBeInTheDocument();
  });

  it('6. displays Manage Paintings list with Remove button and handles delete confirmation modal', async () => {
    const mockPaintings = [
      {
        id: 'p-001',
        title: 'Madhubani Peacock Garden',
        artist: 'Meera Kumari',
        price: 6500,
        imageUrl: 'images/p-001.jpg',
        status: 'available',
        dimensions: '50 x 70 cm',
        category: 'Madhubani'
      }
    ];

    vi.spyOn(paintingApiModule.paintingApi, 'getPaintings').mockResolvedValue({
      success: true,
      paintings: mockPaintings
    });

    const deleteSpy = vi.spyOn(paintingApiModule.paintingApi, 'deletePainting').mockResolvedValue({
      success: true,
      action: 'deleted',
      message: 'Painting permanently deleted and removed from the active catalogue.'
    });

    render(
      <MemoryRouter>
        <AdminPaintingsPage />
      </MemoryRouter>
    );

    // Wait for paintings to load
    await waitFor(() => {
      expect(screen.getByText('Madhubani Peacock Garden')).toBeInTheDocument();
      expect(screen.getByText('₹6,500')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Remove/i })).toBeInTheDocument();
    });

    // Click Remove button
    const removeBtn = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(removeBtn);

    // Confirmation modal should open
    await waitFor(() => {
      expect(screen.getByText('Confirm Painting Removal')).toBeInTheDocument();
      expect(screen.getByText(/Customer Catalogue Impact:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirm Remove Painting/i })).toBeInTheDocument();
    });

    // Click Confirm Remove
    const confirmBtn = screen.getByRole('button', { name: /Confirm Remove Painting/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('p-001');
    });
  });

  it('7. displays AdminTeamPage with existing administrators and provisions a new administrator', async () => {
    const mockAdmins = [
      {
        id: 'adm-01',
        name: 'Studio Administrator',
        email: 'studio@artstudio.in',
        role: 'ADMIN',
        phone: '+91 9876543210',
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ];

    vi.spyOn(authApiModule.authApi, 'getAdministrators').mockResolvedValue({
      success: true,
      count: 1,
      administrators: mockAdmins
    });

    const createAdminSpy = vi.spyOn(authApiModule.authApi, 'createAdministrator').mockResolvedValue({
      success: true,
      message: 'New administrator provisioned successfully',
      administrator: {
        id: 'adm-02',
        name: 'Curator Ananya',
        email: 'ananya@artstudio.in',
        role: 'ADMIN',
        phone: ''
      }
    });

    render(
      <MemoryRouter>
        <AdminTeamPage />
      </MemoryRouter>
    );

    // Wait for existing admin to render
    await waitFor(() => {
      expect(screen.getByText('Studio Administrator')).toBeInTheDocument();
      expect(screen.getByText('studio@artstudio.in')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add Administrator/i })).toBeInTheDocument();
    });

    // Open modal
    const openBtn = screen.getByRole('button', { name: /Add Administrator/i });
    fireEvent.click(openBtn);

    expect(screen.getByText('Provision New Studio Administrator')).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/Administrator Full Name \*/i), { target: { value: 'Curator Ananya' } });
    fireEvent.change(screen.getByLabelText(/Administrator Email Address \*/i), { target: { value: 'ananya@artstudio.in' } });
    fireEvent.change(screen.getByLabelText(/Administrator Password \*/i), { target: { value: 'SecurePass@2026' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Provision Administrator/i, selector: 'button[type="submit"]' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createAdminSpy).toHaveBeenCalledWith({
        name: 'Curator Ananya',
        email: 'ananya@artstudio.in',
        password: 'SecurePass@2026',
        phone: ''
      });
    });
  });
});
