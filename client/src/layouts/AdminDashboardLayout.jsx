import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { AdminThemeToggle } from '../components/AdminThemeToggle.jsx';
import {
  LayoutDashboard,
  Palette,
  PlusCircle,
  ShoppingBag,
  Brush,
  Coffee,
  LogOut,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Users,
  Settings
} from 'lucide-react';

export const AdminDashboardLayout = () => {
  const { user, logout } = useAuth();
  const { themeMode, setTheme } = useTheme();
  const navigate = useNavigate();

  // Enforce dark theme by default for first-time admin visitors
  useEffect(() => {
    try {
      const savedGuest = localStorage.getItem('kalakriti_theme_preference_guest');
      const userKey = user ? `kalakriti_theme_preference_${user.id || user._id}` : null;
      const savedUser = userKey ? localStorage.getItem(userKey) : null;
      const savedAdmin = localStorage.getItem('kalakriti_admin_theme');

      if (!savedUser && !savedAdmin && savedGuest === null && themeMode === 'system') {
        setTheme('dark');
      }
    } catch {
      // localStorage may be disabled
    }
  }, [user, themeMode, setTheme]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Admin Subheader Bar with Live Branding & Theme Selector */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0.65rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'var(--color-terracotta-light)',
              color: 'var(--color-terracotta)',
              padding: '0.3rem 0.7rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-terracotta-border)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}
          >
            <ShieldCheck size={14} />
            <span>Studio Management Console</span>
          </div>

          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }} className="desktop-nav">
            Logged in as <strong>{user?.name || 'Administrator'}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NavLink
            to="/catalogue"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)'
            }}
            title="Open customer catalogue in new tab"
          >
            <span>Live Public Store</span>
            <ExternalLink size={13} />
          </NavLink>

          {/* Dedicated Header Theme Selector (Dark / Light / System) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Theme:
            </span>
            <AdminThemeToggle compact={true} showLabels={true} />
          </div>
        </div>
      </div>

      <div className="dashboard-layout" style={{ flex: 1 }}>
        {/* Navigation Sidebar */}
        <aside className="sidebar" aria-label="Studio administration navigation">
          <div className="sidebar-title">Core Operations</div>

          <NavLink
            to="/admin/dashboard"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
          >
            <LayoutDashboard size={18} /> Studio Overview
          </NavLink>

          <NavLink
            to="/admin/paintings"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
          >
            <Palette size={18} /> Manage Paintings
          </NavLink>

          <NavLink
            to="/admin/add-painting"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
          >
            <PlusCircle size={18} /> Add Painting
          </NavLink>

          <div className="sidebar-title" style={{ marginTop: '1.25rem' }}>Client Services</div>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
          >
            <ShoppingBag size={18} /> All Orders
          </NavLink>

          <NavLink
            to="/admin/wall-bookings"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
          >
            <Brush size={18} /> All Wall Bookings
          </NavLink>

          <NavLink
            to="/admin/pottery-requests"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
          >
            <Coffee size={18} /> All Pottery Requests
          </NavLink>

          <div className="sidebar-title" style={{ marginTop: '1.25rem' }}>Administration</div>

          <NavLink
            to="/admin/team"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
          >
            <Users size={18} /> Studio Administrators
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
          >
            <Settings size={18} /> Studio Settings & Mural Pricing
          </NavLink>

          {/* Sidebar Footer with Theme & Logout */}
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0 0.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                Appearance
              </div>
              <AdminThemeToggle compact={false} showLabels={true} />
            </div>

            <button
              onClick={handleLogout}
              className="sidebar-link"
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--color-rose)'
              }}
            >
              <LogOut size={18} /> Logout Session
            </button>
          </div>
        </aside>

        {/* Main Dashboard Canvas */}
        <main className="dashboard-content" id="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
