import React, { useEffect, useState } from 'react';
import { wallBookingApi } from '../../api/wallBookingApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog.jsx';
import { Brush, Calendar, Check, X, CheckCircle, AlertTriangle } from 'lucide-react';

export const AdminWallBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Dialog state for confirmation/decline
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: null, // 'confirm' | 'decline'
    booking: null,
    isProcessing: false,
    dialogError: ''
  });

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
  }, []);

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
          Review calendar dates requested by clients, inspect wall dimensions, and confirm or decline studio visits.
        </p>
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
                      <div style={{ maxWidth: '240px', fontSize: '0.88rem' }}>{b.address}</div>
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
