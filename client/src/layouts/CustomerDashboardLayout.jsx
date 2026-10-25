import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Palette,
  ShoppingBag,
  Brush,
  CalendarDays,
  Coffee,
  Clock,
  User,
  LogOut
} from 'lucide-react';

export const CustomerDashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-title">Customer Space</div>

          <NavLink
            to="/customer/dashboard"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} /> Overview
          </NavLink>

          <NavLink
            to="/catalogue"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Palette size={18} /> Browse Paintings
          </NavLink>

          <NavLink
            to="/customer/orders"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag size={18} /> My Orders
          </NavLink>

          <div className="sidebar-title" style={{ marginTop: '1rem' }}>Studio Services</div>

          <NavLink
            to="/customer/wall-booking"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Brush size={18} /> Book Wall Painting
          </NavLink>

          <NavLink
            to="/customer/wall-bookings"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <CalendarDays size={18} /> My Wall Bookings
          </NavLink>

          <NavLink
            to="/customer/pottery-request"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Coffee size={18} /> Request Custom Pottery
          </NavLink>

          <NavLink
            to="/customer/pottery-requests"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Clock size={18} /> My Pottery Requests
          </NavLink>

          <div className="sidebar-title" style={{ marginTop: '1rem' }}>Account</div>

          <NavLink
            to="/customer/profile"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <User size={18} /> Personal Space
          </NavLink>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={handleLogout}
              className="sidebar-link"
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--color-rose)' }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
