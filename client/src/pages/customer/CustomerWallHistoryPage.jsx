import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wallBookingApi } from '../../api/wallBookingApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { Brush, Calendar, Ban, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export const CustomerWallHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wallBookingApi.getMyBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Helper to calculate days until booking date
  const getDaysUntil = (dateStr) => {
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3) return -1;
    const targetUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);
    const now = new Date();
    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((targetUtc - todayUtc) / (1000 * 60 * 60 * 24));
  };

  const handleCancel = async (bookingId, dateStr) => {
    const days = getDaysUntil(dateStr);
    if (days < 3) {
      alert('This booking cannot be cancelled because it is less than 3 days away.');
      return;
    }

    const confirm = window.confirm(`Are you sure you want to cancel your wall booking for ${dateStr}?`);
    if (!confirm) return;

    try {
      setCancellingId(bookingId);
      setFeedback(null);
      await wallBookingApi.cancelBooking(bookingId);
      setFeedback({ type: 'success', text: `Wall painting booking for ${dateStr} cancelled successfully.` });
      await fetchBookings();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your wall painting bookings..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchBookings} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>My Wall Painting Bookings</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
            Track the status of your requested and confirmed studio mural dates.
          </p>
        </div>
        <Link to="/customer/wall-booking" className="btn btn-primary">
          <Brush size={16} /> Book New Wall Mural
        </Link>
      </div>

      {feedback && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: feedback.type === 'success' ? 'var(--color-olive-light)' : 'var(--color-rose-light)',
          color: feedback.type === 'success' ? 'var(--color-olive)' : 'var(--color-rose)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--color-olive-border)' : 'var(--color-rose-border)'}`
        }}>
          {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{feedback.text}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No wall bookings found"
          description="You have not requested any wall painting murals yet. Schedule a date for our artisans to paint your wall."
          actionText="Book Wall Painting"
          actionLink="/customer/wall-booking"
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scheduled Date</th>
                <th>Location / Address</th>
                <th>Surface Area</th>
                <th>Calculated Price</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const days = getDaysUntil(b.bookingDate);
                const isCancellable = (b.status === 'requested' || b.status === 'confirmed') && days >= 3;
                const isCancelling = cancellingId === b._id;

                return (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={15} color="var(--color-terracotta)" /> {b.bookingDate}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', marginTop: '0.15rem' }}>
                        {days > 0 ? `${days} days away` : days === 0 ? 'Today' : 'Past date'}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '280px', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                        {b.address}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{b.wallSize} sq.ft</span>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                        @ ₹{b.appliedRate}/sq.ft
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-text-main)' }}>
                        ₹{b.totalPrice?.toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isCancellable ? (
                        <button
                          onClick={() => handleCancel(b._id, b.bookingDate)}
                          disabled={isCancelling}
                          className="btn btn-danger btn-sm"
                        >
                          <Ban size={14} /> {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      ) : b.status === 'cancelled' || b.status === 'declined' ? (
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                          No actions
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-ruby)', fontWeight: 500 }} title="Cancellations are only allowed up to 3 days before the date">
                          Within 3-day cutoff
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
