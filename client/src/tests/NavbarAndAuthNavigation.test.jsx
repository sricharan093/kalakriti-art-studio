import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { ProtectedRoute } from '../routes/ProtectedRoute.jsx';
import * as AuthContextModule from '../context/AuthContext.jsx';

describe('Authentication Navigation & Navbar Active Highlighting', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Helper component to display current path in test
  const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location-display">{location.pathname}</div>;
  };

  it('1. shows login form and unauthenticated navigation for logged-out users visiting /login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Navbar />
        <LoginPage />
      </MemoryRouter>
    );

    // Shows login form
    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();

    // Shows Log In and Register in Navbar, but hides dashboard and greeting
    expect(screen.getByRole('link', { name: /^Log In$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Register$/i })).toBeInTheDocument();
    expect(screen.queryByText(/Studio Dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/My Dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hi,/i)).not.toBeInTheDocument();

    // Login button in navbar has active styling
    const loginLink = screen.getByRole('link', { name: /^Log In$/i });
    expect(loginLink).toHaveClass('btn-auth-active');
  });

  it('2. redirects authenticated customers visiting /login to /customer/dashboard', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'cust1', name: 'Rohan Sharma', email: 'rohan@test.com', role: 'CUSTOMER' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/customer/dashboard" element={<div data-testid="customer-dashboard">Customer Dashboard Content</div>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    );

    // Login form is NOT shown
    expect(screen.queryByRole('heading', { name: /Welcome Back/i })).not.toBeInTheDocument();
    // Redirected to customer dashboard
    expect(screen.getByTestId('customer-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('location-display')).toHaveTextContent('/customer/dashboard');
  });

  it('3. redirects authenticated admins visiting /login to /admin/dashboard', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'admin1', name: 'Studio Manager', email: 'studio@artstudio.in', role: 'ADMIN' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<div data-testid="admin-dashboard">Admin Dashboard Content</div>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    );

    // Login form is NOT shown
    expect(screen.queryByRole('heading', { name: /Welcome Back/i })).not.toBeInTheDocument();
    // Redirected to admin dashboard
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('location-display')).toHaveTextContent('/admin/dashboard');
  });

  it('4. displays loading state while session restoration is in progress on /login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      loading: true,
      login: vi.fn(),
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Checking authentication status/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Welcome Back/i })).not.toBeInTheDocument();
  });

  it('5. redirects logged-out users attempting to access protected routes to /login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/customer/dashboard']}>
        <Routes>
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRole="CUSTOMER">
                <div>Protected Secret Customer Data</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-redirect-target">Login Page</div>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Protected Secret Customer Data/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('login-redirect-target')).toBeInTheDocument();
    expect(screen.getByTestId('location-display')).toHaveTextContent('/login');
  });

  it('6. prevents customers from accessing admin protected routes, redirecting to /customer/dashboard', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'cust1', name: 'Rohan', role: 'CUSTOMER' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <div>Admin Secret Controls</div>
              </ProtectedRoute>
            }
          />
          <Route path="/customer/dashboard" element={<div data-testid="cust-redirect">Customer Space</div>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Admin Secret Controls/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('cust-redirect')).toBeInTheDocument();
    expect(screen.getByTestId('location-display')).toHaveTextContent('/customer/dashboard');
  });

  it('7. highlights Paintings Catalogue in Navbar on /catalogue and nested /paintings/:id routes', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={['/catalogue']}>
        <Navbar />
      </MemoryRouter>
    );

    const catalogueLink = screen.getByRole('link', { name: /Paintings Catalogue/i });
    expect(catalogueLink).toHaveClass('active');
    expect(catalogueLink).toHaveAttribute('aria-current', 'page');
    unmount();

    // Also active on nested /paintings/p-001
    render(
      <MemoryRouter initialEntries={['/paintings/p-001']}>
        <Navbar />
      </MemoryRouter>
    );
    const detailCatalogueLink = screen.getByRole('link', { name: /Paintings Catalogue/i });
    expect(detailCatalogueLink).toHaveClass('active');
  });

  it('8. highlights Wall Murals for customer on /customer/wall-booking and /customer/wall-bookings', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'cust1', name: 'Rohan', role: 'CUSTOMER' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={['/customer/wall-booking']}>
        <Navbar />
      </MemoryRouter>
    );

    const wallLink = screen.getByRole('link', { name: /Wall Murals/i });
    expect(wallLink).toHaveClass('active');
    expect(wallLink).toHaveAttribute('aria-current', 'page');
    unmount();

    render(
      <MemoryRouter initialEntries={['/customer/wall-bookings']}>
        <Navbar />
      </MemoryRouter>
    );
    const wallHistoryLink = screen.getByRole('link', { name: /Wall Murals/i });
    expect(wallHistoryLink).toHaveClass('active');
  });

  it('9. highlights Custom Pottery for customer on /customer/pottery-request and /customer/pottery-requests', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'cust1', name: 'Rohan', role: 'CUSTOMER' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={['/customer/pottery-request']}>
        <Navbar />
      </MemoryRouter>
    );

    const potteryLink = screen.getByRole('link', { name: /Custom Pottery/i });
    expect(potteryLink).toHaveClass('active');
    expect(potteryLink).toHaveAttribute('aria-current', 'page');
    unmount();

    render(
      <MemoryRouter initialEntries={['/customer/pottery-requests']}>
        <Navbar />
      </MemoryRouter>
    );
    const potteryHistoryLink = screen.getByRole('link', { name: /Custom Pottery/i });
    expect(potteryHistoryLink).toHaveClass('active');
  });

  it('10. highlights My Dashboard for customer on customer dashboard routes', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'cust1', name: 'Rohan', role: 'CUSTOMER' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/customer/dashboard']}>
        <Navbar />
      </MemoryRouter>
    );

    const dashboardBtn = screen.getByRole('link', { name: /My Dashboard/i });
    expect(dashboardBtn).toHaveClass('btn-dashboard-active');
    expect(dashboardBtn).toHaveAttribute('aria-current', 'page');
  });

  it('11. highlights Studio Dashboard for admin across nested /admin routes and routes Wall Murals/Pottery properly', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'admin1', name: 'Studio Administrator', email: 'studio@artstudio.in', role: 'ADMIN' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    // When on /admin/dashboard
    const { unmount } = render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Studio')).toBeInTheDocument();
    const studioDashBtn = screen.getByRole('link', { name: /Studio Dashboard/i });
    expect(studioDashBtn).toHaveClass('btn-dashboard-active');

    // Wall Murals links to /admin/wall-bookings for ADMIN
    const wallLink = screen.getByRole('link', { name: /Wall Murals/i });
    expect(wallLink).toHaveAttribute('href', '/admin/wall-bookings');

    // Custom Pottery links to /admin/pottery-requests for ADMIN
    const potteryLink = screen.getByRole('link', { name: /Custom Pottery/i });
    expect(potteryLink).toHaveAttribute('href', '/admin/pottery-requests');
    unmount();

    // When on nested /admin/paintings
    render(
      <MemoryRouter initialEntries={['/admin/paintings']}>
        <Navbar />
      </MemoryRouter>
    );
    const nestedStudioDash = screen.getByRole('link', { name: /Studio Dashboard/i });
    expect(nestedStudioDash).toHaveClass('btn-dashboard-active');
  });

  it('12. highlights admin Wall Murals and Pottery when on respective admin sections', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'admin1', name: 'Studio Admin', role: 'ADMIN' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={['/admin/wall-bookings']}>
        <Navbar />
      </MemoryRouter>
    );

    const wallLink = screen.getByRole('link', { name: /Wall Murals/i });
    expect(wallLink).toHaveClass('active');
    unmount();

    render(
      <MemoryRouter initialEntries={['/admin/pottery-requests']}>
        <Navbar />
      </MemoryRouter>
    );
    const potteryLink = screen.getByRole('link', { name: /Custom Pottery/i });
    expect(potteryLink).toHaveClass('active');
  });

  it('13. renders Customer and Administrator segmented login tabs with distinct dynamic descriptions', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    );

    // Initial state: Welcome Back to KalaKriti heading and Customer mode
    expect(screen.getByRole('heading', { name: /Welcome Back to KalaKriti/i })).toBeInTheDocument();
    const customerTab = screen.getByRole('tab', { name: /Customer Login/i });
    const adminTab = screen.getByRole('tab', { name: /Administrator Login/i });
    expect(customerTab).toHaveAttribute('aria-selected', 'true');
    expect(adminTab).toHaveAttribute('aria-selected', 'false');

    // Customer description
    expect(screen.getByText(/Sign in to explore artworks, manage orders, book murals, and submit custom pottery requests\./i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Register as Customer/i })).toBeInTheDocument();

    // Click Administrator tab
    fireEvent.click(adminTab);
    expect(adminTab).toHaveAttribute('aria-selected', 'true');
    expect(customerTab).toHaveAttribute('aria-selected', 'false');

    // Administrator description
    expect(screen.getByText(/Authorized studio personnel can manage artworks, orders, mural bookings, and pottery requests\./i)).toBeInTheDocument();
    // Public customer register link is hidden in admin mode
    expect(screen.queryByRole('link', { name: /Register as Customer/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Administrator accounts must be provisioned by authorized studio personnel/i)).toBeInTheDocument();
  });

  it('14. displays clear error if customer account attempts to sign in through Administrator Login', async () => {
    const mockLogin = vi.fn().mockImplementation(async ({ expectedRole }) => {
      if (expectedRole === 'ADMIN') {
        const err = new Error('This account does not have administrator access. Please use Customer Login.');
        err.response = { status: 403, data: { message: 'This account does not have administrator access. Please use Customer Login.' } };
        throw err;
      }
      return { id: 'cust1', name: 'Rohan Customer', email: 'rohan@example.com', role: 'CUSTOMER' };
    });
    const mockLogout = vi.fn();

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      logout: mockLogout
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    );

    // Switch to Administrator tab
    fireEvent.click(screen.getByRole('tab', { name: /Administrator Login/i }));

    // Fill in customer credentials
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'rohan@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i, { selector: 'input' }), { target: { value: 'CustomerPass123' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('This account does not have administrator access. Please use Customer Login.')).toBeInTheDocument();
    });
  });

  it('15. allows valid administrator to sign in through Administrator Login and redirects to /admin/dashboard', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      id: 'admin1',
      name: 'Studio Administrator',
      email: 'studio@artstudio.in',
      role: 'ADMIN'
    });

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<div data-testid="admin-dash">Admin Dashboard Screen</div>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    );

    // Switch to Administrator tab
    fireEvent.click(screen.getByRole('tab', { name: /Administrator Login/i }));
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'studio@artstudio.in' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i, { selector: 'input' }), { target: { value: 'Studio@123' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In as Administrator/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'studio@artstudio.in',
        password: 'Studio@123',
        expectedRole: 'ADMIN'
      });
      expect(screen.getByTestId('admin-dash')).toBeInTheDocument();
      expect(screen.getByTestId('location-display')).toHaveTextContent('/admin/dashboard');
    });
  });

  it('16. prevents an administrator logging in on Customer Login tab from being treated as customer', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      id: 'admin1',
      name: 'Studio Administrator',
      email: 'studio@artstudio.in',
      role: 'ADMIN'
    });

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<div data-testid="admin-dash">Admin Dashboard Screen</div>} />
          <Route path="/customer/dashboard" element={<div data-testid="cust-dash">Customer Space</div>} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    );

    // Keep on default Customer tab, but log in with admin account
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'studio@artstudio.in' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i, { selector: 'input' }), { target: { value: 'Studio@123' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In as Customer/i }));

    await waitFor(() => {
      // Must redirect to /admin/dashboard, NOT customer dashboard
      expect(screen.queryByTestId('cust-dash')).not.toBeInTheDocument();
      expect(screen.getByTestId('admin-dash')).toBeInTheDocument();
      expect(screen.getByTestId('location-display')).toHaveTextContent('/admin/dashboard');
    });
  });
});

