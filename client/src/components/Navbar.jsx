import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Palette, User as UserIcon, LogOut, Menu, X, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const pathname = location.pathname;

  // Active section detection using current router pathname
  const isCatalogueActive =
    pathname === '/catalogue' || pathname.startsWith('/paintings');

  const isWallMuralsActive =
    user?.role === 'ADMIN'
      ? pathname === '/admin/wall-bookings'
      : (pathname === '/customer/wall-booking' || pathname === '/customer/wall-bookings');

  const isPotteryActive =
    user?.role === 'ADMIN'
      ? pathname === '/admin/pottery-requests'
      : (pathname === '/customer/pottery-request' || pathname === '/customer/pottery-requests');

  const isAdminDashboardActive =
    user?.role === 'ADMIN' && pathname.startsWith('/admin');

  const isCustomerDashboardActive =
    user?.role === 'CUSTOMER' && pathname.startsWith('/customer');

  const isLoginActive = pathname === '/login';
  const isRegisterActive = pathname === '/register';

  // Role-appropriate destination URLs
  const wallMuralsLink =
    user?.role === 'ADMIN'
      ? '/admin/wall-bookings'
      : '/customer/wall-booking';

  const potteryLink =
    user?.role === 'ADMIN'
      ? '/admin/pottery-requests'
      : '/customer/pottery-request';

  return (
    <nav style={{
      backgroundColor: 'var(--color-bg-nav, var(--color-bg-card))',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
      transition: 'background-color 0.25s ease, border-color 0.25s ease'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-terracotta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Palette size={22} />
          </div>
          <div>
            <span className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--color-text-main)' }}>
              KalaKriti
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-terracotta)', fontWeight: 600 }}>
              Art Studio & Workshop
            </span>
          </div>
        </Link>

        {/* Mobile menu toggle button */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
          {/* Paintings Catalogue Link */}
          <Link
            to="/catalogue"
            className={`nav-link ${isCatalogueActive ? 'active' : ''}`}
            aria-current={isCatalogueActive ? 'page' : undefined}
          >
            Paintings Catalogue
          </Link>

          {/* Wall Murals Link */}
          <Link
            to={wallMuralsLink}
            className={`nav-link ${isWallMuralsActive ? 'active' : ''}`}
            aria-current={isWallMuralsActive ? 'page' : undefined}
          >
            <span>Wall Murals</span>
            <span style={{
              fontSize: '0.65rem',
              padding: '0.15rem 0.45rem',
              backgroundColor: isWallMuralsActive ? 'var(--color-ochre)' : 'var(--color-ochre-light)',
              color: isWallMuralsActive ? '#FFFFFF' : 'var(--color-ochre)',
              borderRadius: '4px',
              fontWeight: 700
            }}>
              ₹150/sq.ft
            </span>
          </Link>

          {/* Custom Pottery Link */}
          <Link
            to={potteryLink}
            className={`nav-link ${isPotteryActive ? 'active' : ''}`}
            aria-current={isPotteryActive ? 'page' : undefined}
          >
            Custom Pottery
          </Link>

          {/* User auth state */}
          {loading ? (
            <div style={{ width: '120px', height: '36px' }} />
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginLeft: '0.5rem' }}>
              {user.role === 'ADMIN' ? (
                <Link
                  to="/admin/dashboard"
                  className={`btn btn-sm ${isAdminDashboardActive ? 'btn-dashboard-active' : 'btn-secondary'}`}
                  style={!isAdminDashboardActive ? { borderColor: 'var(--color-terracotta)', color: 'var(--color-terracotta)' } : {}}
                  aria-current={isAdminDashboardActive ? 'page' : undefined}
                >
                  <Shield size={16} /> Studio Dashboard
                </Link>
              ) : (
                <Link
                  to="/customer/dashboard"
                  className={`btn btn-sm ${isCustomerDashboardActive ? 'btn-dashboard-active' : 'btn-secondary'}`}
                  aria-current={isCustomerDashboardActive ? 'page' : undefined}
                >
                  <UserIcon size={16} /> My Dashboard
                </Link>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Hi, <strong>{user.name ? user.name.split(' ')[0] : 'Artist'}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Log out"
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
              <Link
                to="/login"
                className={`btn btn-secondary btn-sm ${isLoginActive ? 'btn-auth-active' : ''}`}
                aria-current={isLoginActive ? 'page' : undefined}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className={`btn btn-primary btn-sm ${isRegisterActive ? 'btn-auth-active' : ''}`}
                aria-current={isRegisterActive ? 'page' : undefined}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu">
          <Link
            to="/catalogue"
            onClick={() => setMobileMenuOpen(false)}
            className={`nav-link ${isCatalogueActive ? 'active' : ''}`}
          >
            Paintings Catalogue
          </Link>
          <Link
            to={wallMuralsLink}
            onClick={() => setMobileMenuOpen(false)}
            className={`nav-link ${isWallMuralsActive ? 'active' : ''}`}
          >
            <span>Wall Murals</span>
            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', backgroundColor: 'var(--color-ochre-light)', color: 'var(--color-ochre)', borderRadius: '4px', fontWeight: 700 }}>
              ₹150/sq.ft
            </span>
          </Link>
          <Link
            to={potteryLink}
            onClick={() => setMobileMenuOpen(false)}
            className={`nav-link ${isPotteryActive ? 'active' : ''}`}
          >
            Custom Pottery
          </Link>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                  Signed in as <strong>{user.name}</strong> ({user.role})
                </div>
                {user.role === 'ADMIN' ? (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`btn btn-sm ${isAdminDashboardActive ? 'btn-dashboard-active' : 'btn-secondary'}`}
                  >
                    <Shield size={16} /> Studio Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/customer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`btn btn-sm ${isCustomerDashboardActive ? 'btn-dashboard-active' : 'btn-secondary'}`}
                  >
                    <UserIcon size={16} /> My Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--color-ruby)', justifyContent: 'flex-start' }}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`btn btn-secondary btn-sm ${isLoginActive ? 'btn-auth-active' : ''}`}
                  style={{ flex: 1 }}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`btn btn-primary btn-sm ${isRegisterActive ? 'btn-auth-active' : ''}`}
                  style={{ flex: 1 }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
