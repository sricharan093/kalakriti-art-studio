import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout.jsx';
import { CustomerDashboardLayout } from '../layouts/CustomerDashboardLayout.jsx';
import { AdminDashboardLayout } from '../layouts/AdminDashboardLayout.jsx';

// Route Guard
import { ProtectedRoute } from './ProtectedRoute.jsx';

// Public Pages
import { HomePage } from '../pages/HomePage.jsx';
import { CataloguePage } from '../pages/CataloguePage.jsx';
import { PaintingDetailPage } from '../pages/PaintingDetailPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

// Customer Pages
import { CustomerOverview } from '../pages/customer/CustomerOverview.jsx';
import { CustomerOrdersPage } from '../pages/customer/CustomerOrdersPage.jsx';
import { CustomerWallBookingPage } from '../pages/customer/CustomerWallBookingPage.jsx';
import { CustomerWallHistoryPage } from '../pages/customer/CustomerWallHistoryPage.jsx';
import { CustomerPotteryRequestPage } from '../pages/customer/CustomerPotteryRequestPage.jsx';
import { CustomerPotteryHistoryPage } from '../pages/customer/CustomerPotteryHistoryPage.jsx';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage.jsx';

// Admin Pages
import { AdminOverview } from '../pages/admin/AdminOverview.jsx';
import { AdminPaintingsPage } from '../pages/admin/AdminPaintingsPage.jsx';
import { AdminAddPaintingPage } from '../pages/admin/AdminAddPaintingPage.jsx';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage.jsx';
import { AdminWallBookingsPage } from '../pages/admin/AdminWallBookingsPage.jsx';
import { AdminPotteryPage } from '../pages/admin/AdminPotteryPage.jsx';
import { AdminTeamPage } from '../pages/admin/AdminTeamPage.jsx';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with Main Header/Footer Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/paintings/:id" element={<PaintingDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Route>

      {/* Customer Protected Space */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRole="CUSTOMER">
            <CustomerDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerOverview />} />
        <Route path="orders" element={<CustomerOrdersPage />} />
        <Route path="wall-booking" element={<CustomerWallBookingPage />} />
        <Route path="wall-bookings" element={<CustomerWallHistoryPage />} />
        <Route path="pottery-request" element={<CustomerPotteryRequestPage />} />
        <Route path="pottery-requests" element={<CustomerPotteryHistoryPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
      </Route>

      {/* Admin Studio Protected Space */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="paintings" element={<AdminPaintingsPage />} />
        <Route path="add-painting" element={<AdminAddPaintingPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="wall-bookings" element={<AdminWallBookingsPage />} />
        <Route path="pottery-requests" element={<AdminPotteryPage />} />
        <Route path="team" element={<AdminTeamPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="mural-pricing" element={<AdminSettingsPage />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
    </Routes>
  );
};
