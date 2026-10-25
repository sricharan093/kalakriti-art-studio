import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsApi } from '../../api/statsApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import {
  ShoppingBag,
  Brush,
  Coffee,
  ArrowRight,
  Calendar,
  Sparkles,
  Palette,
  Clock
} from 'lucide-react';

export const CustomerOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await statsApi.getCustomerStats();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Curating your art portfolio & studio activity..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStats} />;

  const stats = data?.stats || { totalOrders: 0, totalBookings: 0, totalPotteryRequests: 0 };
  const recentOrders = data?.recentOrders || [];
  const recentBookings = data?.recentBookings || [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="editorial-tag editorial-tag-terracotta" style={{ marginBottom: '0.75rem' }}>
          <Sparkles size={14} /> Art Collector Portfolio
        </div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.4rem', lineHeight: 1.2 }}>
          Welcome back, {user?.name}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.02rem' }}>
          Overview of your acquired paintings, scheduled mural artist visits, and bespoke ceramic commissions.
        </p>
      </div>

      {/* Real Statistics Cards — Clickable to Relevant Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Purchased Art Card */}
        <Link
          to="/customer/orders"
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
            textDecoration: 'none'
          }}
        >
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-terracotta-light)',
            color: 'var(--color-terracotta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShoppingBag size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Purchased Art
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.1rem' }}>
              {stats.totalOrders}
            </div>
          </div>
        </Link>

        {/* Wall Bookings Card */}
        <Link
          to="/customer/wall-bookings"
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
            textDecoration: 'none'
          }}
        >
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-ochre-light)',
            color: 'var(--color-ochre)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Brush size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Wall Bookings
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.1rem' }}>
              {stats.totalBookings}
            </div>
          </div>
        </Link>

        {/* Pottery Requests Card */}
        <Link
          to="/customer/pottery-requests"
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
            textDecoration: 'none'
          }}
        >
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-olive-light)',
            color: 'var(--color-olive)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Coffee size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Pottery Commissions
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '0.1rem' }}>
              {stats.totalPotteryRequests}
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Action Shortcuts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          padding: '1.75rem',
          backgroundColor: 'var(--color-terracotta-light)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-terracotta-border)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-terracotta)' }}>Browse Original Paintings</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Discover one-of-a-kind Madhubani, Warli, and Tanjore works ready for acquisition.
          </p>
          <Link to="/catalogue" className="btn btn-primary btn-sm" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            Browse Collection <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          padding: '1.75rem',
          backgroundColor: 'var(--color-ochre-light)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #E8CDA8',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-ochre)' }}>Book a Wall Mural</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Commission master artists directly on your walls at transparent ₹150/sq.ft.
          </p>
          <Link to="/customer/wall-booking" className="btn btn-primary btn-sm" style={{ marginTop: 'auto', alignSelf: 'flex-start', backgroundColor: 'var(--color-ochre)' }}>
            Reserve Mural Date <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          padding: '1.75rem',
          backgroundColor: 'var(--color-olive-light)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-olive-border)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-olive)' }}>Commission Pottery</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Select from traditional pottery shapes and authentic Indian mineral glazes.
          </p>
          <Link to="/customer/pottery-request" className="btn btn-primary btn-sm" style={{ marginTop: 'auto', alignSelf: 'flex-start', backgroundColor: 'var(--color-olive)' }}>
            Order Custom Pottery <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Recent Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Recent Art Acquisitions</h3>
            <Link to="/customer/orders" style={{ fontSize: '0.88rem', color: 'var(--color-terracotta)', fontWeight: 600 }}>
              View all orders
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              You have not acquired any paintings yet. Explore the catalogue to acquire original art.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentOrders.map((ord) => (
                <div key={ord._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ord.painting?.title || ord.paintingId}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginTop: '0.15rem' }}>
                      ₹{ord.price?.toLocaleString('en-IN')} • {new Date(ord.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <StatusBadge status={ord.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Upcoming Wall Murals</h3>
            <Link to="/customer/wall-bookings" style={{ fontSize: '0.88rem', color: 'var(--color-terracotta)', fontWeight: 600 }}>
              View all bookings
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              No wall painting visits scheduled yet. Reserve an artisan date for your home.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentBookings.map((b) => (
                <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={15} color="var(--color-ochre)" /> {b.bookingDate}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginTop: '0.15rem' }}>
                      {b.wallSize} sq.ft • ₹{b.totalPrice?.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
