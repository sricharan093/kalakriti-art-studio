import React, { useEffect } from 'react';
import { StatusBadge } from './StatusBadge.jsx';
import {
  AlertTriangle,
  Calendar,
  MapPin,
  Maximize2,
  DollarSign,
  User,
  X,
  Loader2
} from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  bookingDetails,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // 'primary' (terracotta) or 'danger' (rose)
  isProcessing = false,
  error = '',
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isProcessing) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (!isProcessing) onCancel();
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="modal-content"
        style={{ maxWidth: '520px', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.75rem'
        }}>
          <h3
            id="confirm-dialog-title"
            style={{
              fontSize: '1.25rem',
              margin: 0,
              color: isDanger ? 'var(--color-rose)' : 'var(--color-text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isDanger && <AlertTriangle size={20} color="var(--color-rose)" />}
            {title}
          </h3>

          <button
            onClick={onCancel}
            disabled={isProcessing}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              padding: '0.25rem'
            }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Informative Message */}
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {message}
        </p>

        {/* Error notification if action failed */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-rose-light)',
            border: '1px solid var(--color-rose-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-rose)',
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Booking Details Card */}
        {bookingDetails && (
          <div style={{
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} /> Customer:
              </span>
              <strong>{bookingDetails.customerName || 'Registered Client'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} /> Booking Date:
              </span>
              <strong style={{ color: 'var(--color-terracotta)' }}>{bookingDetails.bookingDate}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Maximize2 size={15} /> Wall Size:
              </span>
              <span>{bookingDetails.wallSize} sq.ft</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DollarSign size={15} /> Total Price:
              </span>
              <strong style={{ fontSize: '1rem', color: 'var(--color-text-main)' }}>
                ₹{bookingDetails.totalPrice?.toLocaleString('en-IN')}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Current Status:</span>
              <StatusBadge status={bookingDetails.status} />
            </div>

            {bookingDetails.address && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.2rem', color: 'var(--color-text-muted)', fontSize: '0.82rem', display: 'flex', gap: '0.35rem' }}>
                <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{bookingDetails.address}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="btn btn-secondary"
            style={{ minWidth: '95px' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={isDanger ? 'btn btn-danger' : 'btn btn-primary'}
            style={
              !isDanger
                ? { backgroundColor: 'var(--color-olive)', borderColor: 'var(--color-olive)', minWidth: '140px' }
                : { minWidth: '140px' }
            }
          >
            {isProcessing ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
