import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { Palette, LogIn, AlertCircle, User, Shield, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const location = useLocation();
  const [loginMode, setLoginMode] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('mode') === 'admin' || params.get('role') === 'admin' ? 'admin' : 'customer';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user, loading, login, logout } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect according to verified role
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const from = location.state?.from?.pathname;
        const target = from && from !== '/login' ? from : '/customer/dashboard';
        navigate(target, { replace: true });
      }
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return <LoadingSpinner message="Checking authentication status..." />;
  }

  // Prevent flash of login form if user session already exists
  if (user) {
    const from = location.state?.from?.pathname;
    const destination = user.role === 'ADMIN'
      ? '/admin/dashboard'
      : (from && from !== '/login' ? from : '/customer/dashboard');
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const loggedInUser = await login({
        email,
        password,
        expectedRole: loginMode === 'admin' ? 'ADMIN' : undefined
      });

      // Role check: If admin mode was selected but account lacks administrator role
      if (loginMode === 'admin' && loggedInUser.role !== 'ADMIN') {
        await logout();
        setError('This account does not have administrator access. Please use Customer Login.');
        return;
      }

      // If user is verified ADMIN (even if logged in via customer tab), redirect to admin dashboard
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const from = location.state?.from?.pathname;
        const target = from && from !== '/login' ? from : '/customer/dashboard';
        navigate(target, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '480px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-terracotta-light)',
            color: 'var(--color-terracotta)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Palette size={26} />
          </div>
          <h1 style={{
            fontSize: '1.8rem',
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-text-main)',
            marginBottom: '0.4rem',
            fontWeight: 700
          }}>
            Welcome Back to KalaKriti
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            Contemporary Indian Art Studio &amp; Gallery
          </p>
        </div>

        {/* Tab Selector / Segmented Buttons */}
        <div
          role="tablist"
          aria-label="Login Account Type"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.35rem',
            backgroundColor: 'var(--color-bg-subtle)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-border)'
          }}
        >
          <button
            type="button"
            role="tab"
            id="tab-customer"
            aria-selected={loginMode === 'customer'}
            aria-controls="login-mode-description"
            onClick={() => {
              setLoginMode('customer');
              setError('');
            }}
            style={{
              padding: '0.65rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: loginMode === 'customer' ? 600 : 500,
              backgroundColor: loginMode === 'customer' ? 'var(--color-terracotta)' : 'transparent',
              color: loginMode === 'customer' ? '#ffffff' : 'var(--color-text-secondary)',
              boxShadow: loginMode === 'customer' ? '0 2px 8px rgba(212, 95, 53, 0.25)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <User size={16} />
            <span>Customer Login</span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-admin"
            aria-selected={loginMode === 'admin'}
            aria-controls="login-mode-description"
            onClick={() => {
              setLoginMode('admin');
              setError('');
            }}
            style={{
              padding: '0.65rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: loginMode === 'admin' ? 600 : 500,
              backgroundColor: loginMode === 'admin' ? 'var(--color-terracotta)' : 'transparent',
              color: loginMode === 'admin' ? '#ffffff' : 'var(--color-text-secondary)',
              boxShadow: loginMode === 'admin' ? '0 2px 8px rgba(212, 95, 53, 0.25)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Shield size={16} />
            <span>Administrator Login</span>
          </button>
        </div>

        {/* Dynamic Mode Description Panel */}
        <div
          id="login-mode-description"
          role="tabpanel"
          aria-labelledby={loginMode === 'customer' ? 'tab-customer' : 'tab-admin'}
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1.1rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
            {loginMode === 'customer' ? (
              <User size={16} style={{ color: 'var(--color-terracotta)' }} />
            ) : (
              <Shield size={16} style={{ color: 'var(--color-terracotta)' }} />
            )}
            <h2 style={{
              margin: 0,
              fontSize: '1rem',
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-text-main)',
              fontWeight: 600
            }}>
              {loginMode === 'customer' ? 'Customer Login' : 'Administrator Login'}
            </h2>
          </div>
          <p style={{
            margin: 0,
            color: 'var(--color-text-muted)',
            fontSize: '0.86rem',
            lineHeight: '1.45'
          }}>
            {loginMode === 'customer'
              ? 'Sign in to explore artworks, manage orders, book murals, and submit custom pottery requests.'
              : 'Authorized studio personnel can manage artworks, orders, mural bookings, and pottery requests.'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--color-rose-light)',
              border: '1px solid var(--color-rose-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-rose)',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              className="form-input"
              placeholder={loginMode === 'admin' ? 'studio@artstudio.in' : 'you@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
          >
            <LogIn size={18} /> {submitting ? 'Authenticating...' : (loginMode === 'admin' ? 'Sign In as Administrator' : 'Sign In as Customer')}
          </button>
        </form>

        {loginMode === 'customer' ? (
          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1.25rem',
            fontSize: '0.9rem',
            color: 'var(--color-text-muted)'
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>
              Register as Customer
            </Link>
          </div>
        ) : (
          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1.25rem',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
              <Shield size={14} style={{ color: 'var(--color-terracotta)' }} />
              <span>Protected Administrator Portal</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.4' }}>
              Administrator accounts must be provisioned by authorized studio personnel. Public registration is not permitted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
