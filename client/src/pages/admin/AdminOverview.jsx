import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { statsApi } from '../../api/statsApi.js';
import { getArtworkUrl, handleImageError } from '../../utils/imageUrl.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import {
  Users,
  Palette,
  ShoppingBag,
  Brush,
  Coffee,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Sparkles,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const res = await statsApi.getAdminStats();
      setData(res);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to retrieve studio metrics from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="skeleton-box" style={{ width: '180px', height: '24px', marginBottom: '1rem' }} />
          <div className="skeleton-box" style={{ width: '380px', height: '42px', marginBottom: '0.75rem' }} />
          <div className="skeleton-box" style={{ width: '560px', height: '20px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="card" style={{ padding: '1.5rem', height: '110px' }}>
              <div className="skeleton-box" style={{ width: '100%', height: '100%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <ErrorMessage
          message={`Studio database synchronization failed: ${error}`}
          onRetry={() => fetchStats(false)}
        />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const recentWallBookings = data?.recentWallBookings || [];
  const recentPotteryRequests = data?.recentPotteryRequests || [];
  const recentPaintings = data?.recentPaintings || [];

  // Pending counts for quick badge alert
  const totalPendingAction = (stats.wallBookingsRequested || 0) + (stats.potteryRequested || 0);

  // Distribution calculations
  const totalMurals = (stats.wallBookingsRequested || 0) + (stats.wallBookingsConfirmed || 0) + (stats.wallBookingsDeclined || 0);
  const muralPendingPct = totalMurals > 0 ? Math.round(((stats.wallBookingsRequested || 0) / totalMurals) * 100) : 0;
  const muralConfirmedPct = totalMurals > 0 ? Math.round(((stats.wallBookingsConfirmed || 0) / totalMurals) * 100) : 0;

  const totalPottery = (stats.potteryRequested || 0) + (stats.potteryAccepted || 0) + (stats.potteryDeclined || 0);
  const potteryPendingPct = totalPottery > 0 ? Math.round(((stats.potteryRequested || 0) / totalPottery) * 100) : 0;
  const potteryAcceptedPct = totalPottery > 0 ? Math.round(((stats.potteryAccepted || 0) / totalPottery) * 100) : 0;

  return (
    <div style={{ maxWidth: '1240px' }}>
      {/* Editorial Header with Live Refresh */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <div className="editorial-tag editorial-tag-terracotta" style={{ marginBottom: '0.65rem' }}>
            <Shield size={14} /> Authoritative Studio Administration
          </div>
          <h1 style={{ fontSize: '2.3rem', marginBottom: '0.35rem', lineHeight: 1.15 }}>
            Studio Operations Overview
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.98rem' }}>
            Live database-backed intelligence, inventory status, and approval queues for KalaKriti Art Studio.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {lastUpdated && (
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }} className="desktop-nav">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            title="Refresh database statistics"
          >
            <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <Link to="/admin/add-painting" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Add Painting
          </Link>
        </div>
      </div>

      {/* Pending Action Banner if actions are required */}
      {totalPendingAction > 0 && (
        <div
          style={{
            backgroundColor: 'var(--color-ochre-light)',
            border: '1px solid var(--color-ochre)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="var(--color-ochre)" />
            <div>
              <strong style={{ color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                Action Required: {totalPendingAction} Pending Client Request{totalPendingAction === 1 ? '' : 's'}
              </strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {stats.wallBookingsRequested || 0} mural appointment{stats.wallBookingsRequested === 1 ? '' : 's'} and{' '}
                {stats.potteryRequested || 0} pottery commission{stats.potteryRequested === 1 ? '' : 's'} awaiting studio review.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {stats.wallBookingsRequested > 0 && (
              <Link to="/admin/wall-bookings" className="btn btn-sm" style={{ backgroundColor: 'var(--color-ochre)', color: '#FFFFFF', borderColor: 'var(--color-ochre)' }}>
                Review Murals
              </Link>
            )}
            {stats.potteryRequested > 0 && (
              <Link to="/admin/pottery-requests" className="btn btn-sm btn-secondary">
                Review Pottery
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Section 1: The 8 Authoritative Metric Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Core Studio Metrics</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
            Real MongoDB Collection Aggregations
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {/* 1. Total Registered Customers */}
          <Link to="/admin/orders" data-testid="stat-total-customers" className="admin-stat-card" title="Click to view customer orders">
            <div
              className="admin-stat-icon-wrap"
              style={{
                backgroundColor: 'var(--color-terracotta-light)',
                color: 'var(--color-terracotta)',
                border: '1px solid var(--color-terracotta-border)'
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                1. Registered Customers
              </div>
              <div className="admin-stat-value" style={{ color: 'var(--color-text-main)' }}>
                {stats.totalCustomers ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <span>Active client accounts</span>
                <ChevronRight size={12} />
              </div>
            </div>
          </Link>

          {/* 2. Available Paintings */}
          <Link to="/admin/paintings" data-testid="stat-paintings-available" className="admin-stat-card" title="Click to view available paintings">
            <div
              className="admin-stat-icon-wrap"
              style={{
                backgroundColor: 'var(--color-olive-light)',
                color: 'var(--color-olive)',
                border: '1px solid var(--color-olive-border)'
              }}
            >
              <Palette size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                2. Available Paintings
              </div>
              <div className="admin-stat-value" style={{ color: 'var(--color-olive)' }}>
                {stats.paintingsAvailable ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <span>In store catalogue</span>
                <ChevronRight size={12} />
              </div>
            </div>
          </Link>

          {/* 3. Sold Paintings */}
          <Link to="/admin/paintings" data-testid="stat-paintings-sold" className="admin-stat-card" title="Click to inspect sold paintings">
            <div
              className="admin-stat-icon-wrap"
              style={{
                backgroundColor: 'var(--color-rose-light)',
                color: 'var(--color-rose)',
                border: '1px solid var(--color-rose-border)'
              }}
            >
              <ShoppingBag size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                3. Sold Paintings
              </div>
              <div className="admin-stat-value" style={{ color: 'var(--color-rose)' }}>
                {stats.paintingsSold ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <span>Archived sales</span>
                <ChevronRight size={12} />
              </div>
            </div>
          </Link>

          {/* 4. Total Orders */}
          <Link to="/admin/orders" data-testid="stat-total-orders" className="admin-stat-card" title="Click to view all client orders">
            <div
              className="admin-stat-icon-wrap"
              style={{
                backgroundColor: 'var(--color-gold-light)',
                color: 'var(--color-gold)',
                border: '1px solid var(--color-gold-border)'
              }}
            >
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                4. Total Orders
              </div>
              <div className="admin-stat-value" style={{ color: 'var(--color-gold)' }}>
                {stats.totalOrders ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <span>Completed checkout</span>
                <ChevronRight size={12} />
              </div>
            </div>
          </Link>

          {/* 5. Pending Wall-Mural Bookings */}
          <Link to="/admin/wall-bookings" data-testid="stat-wall-bookings-requested" className="admin-stat-card" title="Click to review pending wall bookings">
            <div
              className="admin-stat-icon-wrap"
              style={{
                backgroundColor: 'var(--color-ochre-light)',
                color: 'var(--color-ochre)',
                border: '1px solid #E8CDA8'
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                5. Pending Murals
              </div>
              <div className="admin-stat-value" style={{ color: 'var(--color-ochre)' }}>
                {stats.wallBookingsRequested ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <span>Awaiting confirmation</span>
                <ChevronRight size={12} />
              </div>
            </div>
          </Link>

          {/* 6. Confirmed Wall-Mural Bookings */}
          <Link to="/admin/wall-bookings" data-testid="stat-wall-bookings-confirmed" className="admin-stat-card" title="Click to view confirmed mural schedules">
            <div
              className="admin-stat-icon-wrap"
              style={{
                backgroundColor: 'var(--color-olive-light)',
                color: 'var(--color-olive)',
                border: '1px solid var(--color-olive-border)'
              }}
            >
              <Brush size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                6. Confirmed Murals
              </div>
              <div className="admin-stat-value" style={{ color: 'var(--color-olive)' }}>
                {stats.wallBookingsConfirmed ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <span>Scheduled @ ₹150/sq.ft</span>
                <ChevronRight size={12} />
              </div>
            </div>
          </Link>

          {/* 7. Pending Pottery Requests */}
          <Link to="/admin/pottery-requests" data-testid="stat-pottery-requested" className="admin-stat-card" title="Click to review pending pottery commissions">
            <div
              className="admin-stat-icon-wrap"
              style={{
                backgroundColor: 'var(--color-ochre-light)',
                color: 'var(--color-ochre)',
                border: '1px solid #E8CDA8'
              }}
            >
              <Coffee size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                7. Pending Pottery
              </div>
              <div className="admin-stat-value" style={{ color: 'var(--color-ochre)' }}>
                {stats.potteryRequested ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <span>Glaze & item review</span>
                <ChevronRight size={12} />
              </div>
            </div>
          </Link>

          {/* 8. Accepted Pottery Commissions */}
          <Link to="/admin/pottery-requests" data-testid="stat-pottery-accepted" className="admin-stat-card" title="Click to view pottery queued for kiln firing">
            <div
              className="admin-stat-icon-wrap"
              style={{
                backgroundColor: 'var(--color-olive-light)',
                color: 'var(--color-olive)',
                border: '1px solid var(--color-olive-border)'
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                8. Accepted Pottery
              </div>
              <div className="admin-stat-value" style={{ color: 'var(--color-olive)' }}>
                {stats.potteryAccepted ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <span>Queued for kiln firing</span>
                <ChevronRight size={12} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Section 2: Operational Pipelines & Status Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
        {/* Wall Murals Pipeline */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-ochre-light)', color: 'var(--color-ochre)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brush size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Wall Murals Service</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Fixed Tariff: ₹150 per sq. ft.</span>
              </div>
            </div>
            <Link to="/admin/wall-bookings" className="btn btn-secondary btn-sm">
              Manage Bookings
            </Link>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Clients request on-site dates for hand-painted Warli, Gond, and Pichwai murals. The studio confirms calendar dates and artist deployment.
          </p>

          {/* Distribution Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
              <span>Status Distribution ({totalMurals} Total Requests)</span>
              <span>{muralConfirmedPct}% Confirmed</span>
            </div>
            <div className="distribution-track">
              <div className="distribution-segment" style={{ width: `${muralConfirmedPct}%`, backgroundColor: 'var(--color-olive)' }} title={`Confirmed: ${stats.wallBookingsConfirmed}`} />
              <div className="distribution-segment" style={{ width: `${muralPendingPct}%`, backgroundColor: 'var(--color-ochre)' }} title={`Pending: ${stats.wallBookingsRequested}`} />
              <div className="distribution-segment" style={{ width: `${Math.max(0, 100 - muralConfirmedPct - muralPendingPct)}%`, backgroundColor: 'var(--color-rose)' }} title={`Declined: ${stats.wallBookingsDeclined || 0}`} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-ochre)', fontWeight: 700, textTransform: 'uppercase' }}>Pending</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-ochre)', marginTop: '0.2rem' }}>
                {stats.wallBookingsRequested || 0}
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-olive)', fontWeight: 700, textTransform: 'uppercase' }}>Confirmed</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-olive)', marginTop: '0.2rem' }}>
                {stats.wallBookingsConfirmed || 0}
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-rose)', fontWeight: 700, textTransform: 'uppercase' }}>Declined</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-rose)', marginTop: '0.2rem' }}>
                {stats.wallBookingsDeclined || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Pottery Commissions Pipeline */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-olive-light)', color: 'var(--color-olive)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Coffee size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Custom Pottery Atelier</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Wheel-Thrown & Kiln Fired</span>
              </div>
            </div>
            <Link to="/admin/pottery-requests" className="btn btn-secondary btn-sm">
              Manage Pottery
            </Link>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Handcrafted Kulhads, Surahis, Matkas, and Diya sets customized with traditional mineral glazes (Kumkum Red, Haldi Yellow, Mehendi Green).
          </p>

          {/* Distribution Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
              <span>Commission Status ({totalPottery} Total Requests)</span>
              <span>{potteryAcceptedPct}% In Kiln / Accepted</span>
            </div>
            <div className="distribution-track">
              <div className="distribution-segment" style={{ width: `${potteryAcceptedPct}%`, backgroundColor: 'var(--color-olive)' }} title={`Accepted: ${stats.potteryAccepted}`} />
              <div className="distribution-segment" style={{ width: `${potteryPendingPct}%`, backgroundColor: 'var(--color-ochre)' }} title={`Pending: ${stats.potteryRequested}`} />
              <div className="distribution-segment" style={{ width: `${Math.max(0, 100 - potteryAcceptedPct - potteryPendingPct)}%`, backgroundColor: 'var(--color-rose)' }} title={`Declined: ${stats.potteryDeclined || 0}`} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-ochre)', fontWeight: 700, textTransform: 'uppercase' }}>Reviewing</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-ochre)', marginTop: '0.2rem' }}>
                {stats.potteryRequested || 0}
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-olive)', fontWeight: 700, textTransform: 'uppercase' }}>Accepted</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-olive)', marginTop: '0.2rem' }}>
                {stats.potteryAccepted || 0}
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-rose)', fontWeight: 700, textTransform: 'uppercase' }}>Declined</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-rose)', marginTop: '0.2rem' }}>
                {stats.potteryDeclined || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Recent Activity Feed & Recently Added Paintings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        {/* Recent Database Activity Feed */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} color="var(--color-terracotta)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Recent Studio Orders</h3>
            </div>
            <Link to="/admin/orders" style={{ fontSize: '0.82rem', color: 'var(--color-terracotta)', fontWeight: 600, textDecoration: 'none' }}>
              View All ({stats.totalOrders || 0})
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No orders placed yet. Orders from the public store will stream here in real time.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recentOrders.map((order) => (
                <div
                  key={order._id || order.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--color-bg-elevated)' }}>
                    <img
                      src={getArtworkUrl(order.painting?.imageUrl)}
                      alt={order.painting?.title || 'Artwork'}
                      onError={handleImageError}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.painting?.title || 'Purchased Painting'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Collector: {order.customer?.name || order.deliveryAddress?.fullName || 'Collector'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.92rem' }}>
                      ₹{order.totalPrice?.toLocaleString('en-IN') || order.painting?.price?.toLocaleString('en-IN')}
                    </div>
                    <StatusBadge status={order.status || 'placed'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Added Paintings with Thumbnails */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Palette size={20} color="var(--color-olive)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Catalogue Inventory</h3>
            </div>
            <Link to="/admin/paintings" style={{ fontSize: '0.82rem', color: 'var(--color-terracotta)', fontWeight: 600, textDecoration: 'none' }}>
              Manage All
            </Link>
          </div>

          {recentPaintings.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No paintings found. Click "Add Painting" to upload the first original canvas.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recentPaintings.slice(0, 5).map((painting) => (
                <div
                  key={painting._id || painting.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--color-bg-elevated)' }}>
                    <img
                      src={getArtworkUrl(painting.imageUrl)}
                      alt={painting.title}
                      onError={handleImageError}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {painting.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      By {painting.artist} • ID: {painting.id}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.92rem' }}>
                      ₹{painting.price?.toLocaleString('en-IN')}
                    </div>
                    <StatusBadge status={painting.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
