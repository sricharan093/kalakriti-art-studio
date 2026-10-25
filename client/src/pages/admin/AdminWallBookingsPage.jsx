import React, { useEffect, useState } from 'react';
import { wallBookingApi } from '../../api/wallBookingApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog.jsx';
import {
  Brush,
  Calendar,
  Check,
  X,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Settings,
  Save,
  Sparkles
} from 'lucide-react';

export const AdminWallBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Mural Rate Configuration State
  const [currentRate, setCurrentRate] = useState(150);
  const [inputRate, setInputRate] = useState('150');
  const [savingRate, setSavingRate] = useState(false);
  const [rateFeedback, setRateFeedback] = useState(null);

  // Dialog state for confirmation/decline
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: null, // 'confirm' | 'decline'
    booking: null,
    isProcessing: false,
    dialogError: ''
  });

  const fetchRate = async () => {
    try {
      if (typeof wallBookingApi.getMuralRateAdmin === 'function') {
        const data = await wallBookingApi.getMuralRateAdmin();
        if (data && data.ratePerSqFt) {
          setCurrentRate(data.ratePerSqFt);
          setInputRate(String(data.ratePerSqFt));
        }
      }
    } catch {
      // Fallback to default if not configured
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wallBookingApi.getAllBookingsAdmin();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchRate();
  }, []);

  const handleSaveRate = async (e) => {
    e.preventDefault();
    setRateFeedback(null);

    const numericRate = Number(inputRate);
    if (isNaN(numericRate) || numericRate < 10) {
      setRateFeedback({
        type: 'error',
        text: 'Mural rate must be a valid number of at least ₹10 per sq.ft.'
      });
      return;
    }

    if (numericRate > 10000) {
      setRateFeedback({
        type: 'error',
        text: 'Mural rate cannot exceed ₹10,000 per sq.ft.'
      });
      return;
    }

    try {
      setSavingRate(true);
      const res = await wallBookingApi.updateMuralRateAdmin(numericRate);
      setCurrentRate(res.ratePerSqFt || numericRate);
      setRateFeedback({
        type: 'success',
        text: `Mural rate updated to ₹${res.ratePerSqFt || numericRate} per sq.ft successfully. New customer bookings will immediately use this rate.`
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update mural rate.';
      setRateFeedback({
        type: 'error',
        text: msg
      });
    } finally {
      setSavingRate(false);
    }
  };

  const openConfirmDialog = (booking) => {
    setDialogState({
      isOpen: true,
      type: 'confirm',
      booking,
      isProcessing: false,
      dialogError: ''
    });
  };

  const openDeclineDialog = (booking) => {
    setDialogState({
      isOpen: true,
      type: 'decline',
      booking,
      isProcessing: false,
      dialogError: ''
    });
  };

  const closeDialog = () => {
    if (dialogState.isProcessing) return;
    setDialogState({
      isOpen: false,
      type: null,
      booking: null,
      isProcessing: false,
      dialogError: ''
    });
  };

  const handleExecuteDecision = async () => {
    const { booking, type } = dialogState;
    if (!booking || !type) return;

    try {
      setDialogState((prev) => ({ ...prev, isProcessing: true, dialogError: '' }));
      setFeedback(null);

      if (type === 'confirm') {
        await wallBookingApi.confirmBookingAdmin(booking._id);
        setFeedback({
          type: 'success',
          text: `Wall mural booking for ${booking.bookingDate} has been confirmed.`
        });
      } else {
        await wallBookingApi.declineBookingAdmin(booking._id);
        setFeedback({
          type: 'success',
          text: `Wall mural booking for ${booking.bookingDate} has been declined.`
        });
      }

      closeDialog();
      await fetchBookings();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Operation failed.';
      setDialogState((prev) => ({
        ...prev,
        isProcessing: false,
        dialogError: errorMsg
      }));
    }
  };

  if (loading) return <LoadingSpinner message="Fetching all wall painting bookings..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchBookings} />;

  const currentBooking = dialogState.booking;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>All Wall Painting Bookings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
          Review calendar dates requested by clients, inspect wall dimensions, configure studio mural rates, and confirm or decline studio visits.
        </p>
      </div>

      {/* Feature 2: Studio Settings / Mural Pricing Card */}
      <div className="card" style={{
        marginBottom: '2.5rem',
        padding: '1.75rem',
        border: '1px solid var(--color-terracotta-border)',
        backgroundColor: 'var(--color-bg-card)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-terracotta-light)',
              color: 'var(--color-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Settings size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>
                Studio Settings: Mural Pricing Configuration
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Set the studio's official baseline rate for architectural wall painting commissions.
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>
              Current Active Rate:
            </span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--color-terracotta)' }}>
              ₹{currentRate}/sq.ft
            </strong>
          </div>
        </div>

        {rateFeedback && (
          <div style={{
            padding: '0.85rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: rateFeedback.type === 'success' ? 'var(--color-olive-light)' : 'var(--color-rose-light)',
            color: rateFeedback.type === 'success' ? 'var(--color-olive)' : 'var(--color-rose)',
            border: `1px solid ${rateFeedback.type === 'success' ? 'var(--color-olive-border)' : 'var(--color-rose-border)'}`,
            fontSize: '0.9rem'
          }}>
            {rateFeedback.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{rateFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveRate} style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '220px', maxWidth: '300px' }}>
            <label className="form-label" htmlFor="muralRateInput" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Configure New Rate (₹ per Sq.Ft)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--color-text-light)', fontWeight: 600 }}>
                ₹
              </span>
              <input
                id="muralRateInput"
                type="number"
                min={10}
                max={10000}
                step={5}
                required
                value={inputRate}
                onChange={(e) => setInputRate(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '28px', fontSize: '1.05rem', fontWeight: 600 }}
                placeholder="e.g. 180"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingRate || Number(inputRate) === currentRate}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}
          >
            <Save size={16} />
            {savingRate ? 'Saving Rate...' : 'Save Changes'}
          </button>

          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', alignSelf: 'center', marginLeft: 'auto' }}>
            Example: 100 sq.ft × ₹{Number(inputRate) || currentRate} = <strong>₹{((Number(inputRate) || currentRate) * 100).toLocaleString('en-IN')}</strong>. Existing confirmed bookings preserve their agreed price.
          </div>
        </form>
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
          title="No wall bookings in queue"
          description="Client requests for studio mural paintings will appear here for administrative approval."
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking Date</th>
                <th>Client</th>
                <th>Mural Design</th>
                <th>Address</th>
                <th>Wall Size</th>
                <th>Total Price</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const isPending = b.status === 'requested';

                return (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={15} color="var(--color-terracotta)" /> {b.bookingDate}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.customer?.name || 'Client'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                        {b.customer?.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img
                          src={b.selectedDesign?.previewImage || '/images/p-002.jpg'}
                          alt={b.selectedDesign?.name || 'Mural Design'}
                          style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/favicon.svg';
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-main)' }}>
                            {b.selectedDesign?.name || 'Traditional Warli & Folk Murals'}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-light)' }}>
                            Architectural Style
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '220px', fontSize: '0.88rem' }}>{b.address}</div>
                    </td>
                    <td>
                      <strong>{b.wallSize} sq.ft</strong>
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
                      {isPending ? (
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => openConfirmDialog(b)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: 'var(--color-olive)', borderColor: 'var(--color-olive)' }}
                            title="Confirm Booking"
                            aria-label={`Confirm booking on ${b.bookingDate}`}
                          >
                            <Check size={14} /> Confirm
                          </button>
                          <button
                            onClick={() => openDeclineDialog(b)}
                            className="btn btn-danger btn-sm"
                            title="Decline Booking"
                            aria-label={`Decline booking on ${b.bookingDate}`}
                          >
                            <X size={14} /> Decline
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                          Decision recorded
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

      {/* Confirmation Dialog for Confirming Booking */}
      <ConfirmDialog
        isOpen={dialogState.isOpen && dialogState.type === 'confirm'}
        title="Confirm wall mural booking?"
        message="Are you sure you want to confirm this wall mural booking? Its status will change to Confirmed."
        confirmText="Confirm Booking"
        cancelText="Cancel"
        variant="primary"
        isProcessing={dialogState.isProcessing}
        error={dialogState.dialogError}
        bookingDetails={
          currentBooking
            ? {
                customerName: currentBooking.customer?.name,
                bookingDate: currentBooking.bookingDate,
                selectedDesign: currentBooking.selectedDesign,
                wallSize: currentBooking.wallSize,
                address: currentBooking.address,
                totalPrice: currentBooking.totalPrice,
                status: currentBooking.status
              }
            : null
        }
        onConfirm={handleExecuteDecision}
        onCancel={closeDialog}
      />

      {/* Confirmation Dialog for Declining Booking */}
      <ConfirmDialog
        isOpen={dialogState.isOpen && dialogState.type === 'decline'}
        title="Decline wall mural booking?"
        message="Are you sure you want to decline this booking? This action will change its status to Declined."
        confirmText="Decline Booking"
        cancelText="Keep Booking"
        variant="danger"
        isProcessing={dialogState.isProcessing}
        error={dialogState.dialogError}
        bookingDetails={
          currentBooking
            ? {
                customerName: currentBooking.customer?.name,
                bookingDate: currentBooking.bookingDate,
                selectedDesign: currentBooking.selectedDesign,
                wallSize: currentBooking.wallSize,
                address: currentBooking.address,
                totalPrice: currentBooking.totalPrice,
                status: currentBooking.status
              }
            : null
        }
        onConfirm={handleExecuteDecision}
        onCancel={closeDialog}
      />
    </div>
  );
};
