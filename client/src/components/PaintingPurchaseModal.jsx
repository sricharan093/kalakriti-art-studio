import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { orderApi } from '../api/orderApi.js';
import { StatusBadge } from './StatusBadge.jsx';
import {
  X,
  ShieldCheck,
  Truck,
  AlertCircle,
  CheckCircle,
  MapPin,
  User,
  Phone,
  BookmarkCheck,
  ArrowRight
} from 'lucide-react';

const INDIAN_MOBILE_REGEX = /^(?:\+91[\-\s]?)?[0]?[6-9]\d{9}$/;
const INDIAN_PIN_REGEX = /^[1-9][0-9]{5}$/;

export const PaintingPurchaseModal = ({
  isOpen,
  painting,
  onClose,
  onSuccess
}) => {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if current form matches user's saved default address
  const hasSavedDefault = !!(user?.defaultAddress?.streetAddress && user?.defaultAddress?.city);
  const isAddressModifiedFromDefault = hasSavedDefault && (
    formData.streetAddress !== (user.defaultAddress.streetAddress || '') ||
    formData.city !== (user.defaultAddress.city || '') ||
    formData.state !== (user.defaultAddress.state || '') ||
    formData.postalCode !== (user.defaultAddress.postalCode || '') ||
    formData.fullName !== (user.defaultAddress.fullName || user.name || '')
  );

  // Populate address when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      if (user?.defaultAddress?.streetAddress) {
        setFormData({
          fullName: user.defaultAddress.fullName || user.name || '',
          phone: user.defaultAddress.phone || user.phone || '',
          streetAddress: user.defaultAddress.streetAddress || '',
          addressLine2: user.defaultAddress.addressLine2 || '',
          city: user.defaultAddress.city || '',
          state: user.defaultAddress.state || '',
          postalCode: user.defaultAddress.postalCode || ''
        });
        setSaveAsDefault(false);
      } else {
        setFormData({
          fullName: user?.name || '',
          phone: user?.phone || '',
          streetAddress: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: ''
        });
        setSaveAsDefault(false);
      }

      setFieldErrors({});
      setGeneralError('');
      setSuccessMessage('');
      setSubmitting(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, painting, user]);

  if (!isOpen || !painting) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  const validate = () => {
    const errors = {};
    const trimmedName = formData.fullName.trim();
    const trimmedPhone = formData.phone.trim().replace(/[\s\-]/g, '');
    const trimmedStreet = formData.streetAddress.trim();
    const trimmedCity = formData.city.trim();
    const trimmedState = formData.state.trim();
    const trimmedPin = formData.postalCode.trim().replace(/\s/g, '');

    if (!trimmedName || trimmedName.length < 2) {
      errors.fullName = "Recipient's full name is required (min 2 characters).";
    }

    if (!trimmedPhone) {
      errors.phone = 'Indian mobile number is required.';
    } else if (!INDIAN_MOBILE_REGEX.test(trimmedPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).';
    }

    if (!trimmedStreet || trimmedStreet.length < 3) {
      errors.streetAddress = 'House number and street address are required.';
    }

    if (!trimmedCity || trimmedCity.length < 2) {
      errors.city = 'City is required.';
    }

    if (!trimmedState || trimmedState.length < 2) {
      errors.state = 'State is required.';
    }

    if (!trimmedPin) {
      errors.postalCode = 'Six-digit PIN code is required.';
    } else if (!INDIAN_PIN_REGEX.test(trimmedPin)) {
      errors.postalCode = 'Please enter a valid 6-digit Indian PIN code (e.g., 302001).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      const deliveryAddress = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        streetAddress: formData.streetAddress.trim(),
        addressLine2: formData.addressLine2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim()
      };

      const res = saveAsDefault
        ? await orderApi.createOrder({
            paintingId: painting.id,
            deliveryAddress,
            saveAsDefault: true
          })
        : await orderApi.createOrder(painting.id, deliveryAddress);

      if (saveAsDefault && refreshUser) {
        try {
          await refreshUser();
        } catch (e) {
          // ignore refresh error
        }
      }

      setSuccessMessage(`Order placed successfully! "${painting.title}" will be delivered to ${deliveryAddress.fullName}.`);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(res.order);
        }, 1200);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to complete painting purchase.';
      setGeneralError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !painting) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (!submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-modal-title"
    >
      <div
        className="modal-content"
        style={{ maxWidth: '640px', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.85rem'
        }}>
          <div>
            <h2 id="purchase-modal-title" style={{ fontSize: '1.4rem', margin: 0, color: 'var(--color-text-main)' }}>
              Complete Painting Acquisition
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Provide your delivery address to confirm this one-of-a-kind original.
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: submitting ? 'not-allowed' : 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)'
            }}
            aria-label="Close acquisition modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selected Painting Summary Banner */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
          alignItems: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            backgroundColor: 'var(--color-bg-card)',
            flexShrink: 0,
            border: '1px solid var(--color-border)'
          }}>
            <img
              src={`/${painting.imageUrl}`}
              alt={painting.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/favicon.svg';
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="one-of-a-kind-badge" style={{ fontSize: '0.65rem' }}>One of a kind</span>
              <StatusBadge status={painting.status} />
            </div>
            <h4 style={{
              fontSize: '1.1rem',
              margin: '0.2rem 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {painting.title}
            </h4>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
              Artist: <strong>{painting.artist || 'Master Artisan'}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Studio Price
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              ₹{painting.price?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--color-rose-light)',
            border: '1px solid var(--color-rose-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-rose)',
            fontSize: '0.9rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{generalError}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--color-olive-light)',
            border: '1px solid var(--color-olive-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-olive)',
            fontSize: '0.9rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Delivery Address Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-terracotta)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <Truck size={16} /> Delivery Address Information
            </div>

            {hasSavedDefault ? (
              isAddressModifiedFromDefault ? (
                <span className="badge badge-placed" title="This address differs from your saved default">
                  <MapPin size={11} /> Order-Specific Address (Modified)
                </span>
              ) : (
                <span className="badge badge-available" title="Prefilled from your Personal Space">
                  <BookmarkCheck size={11} /> Saved Default Address
                </span>
              )
            ) : null}
          </div>

          {!hasSavedDefault && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <span>No default address saved yet. Fill in your details below to complete your order.</span>
              <Link
                to="/customer/profile"
                target="_blank"
                style={{
                  color: 'var(--color-terracotta)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.82rem'
                }}
              >
                Go to Personal Space <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Recipient Full Name & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="fullName">
                Recipient Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="form-input"
                placeholder="Rohan Sharma"
                value={formData.fullName}
                onChange={handleChange}
                disabled={submitting}
                style={fieldErrors.fullName ? { borderColor: 'var(--color-rose)' } : {}}
              />
              {fieldErrors.fullName && (
                <span className="form-error">{fieldErrors.fullName}</span>
              )}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="phone">
                Indian Mobile Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="form-input"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                disabled={submitting}
                style={fieldErrors.phone ? { borderColor: 'var(--color-rose)' } : {}}
              />
              {fieldErrors.phone && (
                <span className="form-error">{fieldErrors.phone}</span>
              )}
            </div>
          </div>

          {/* Street Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="streetAddress">
              House Number & Street Address *
            </label>
            <input
              id="streetAddress"
              name="streetAddress"
              type="text"
              required
              className="form-input"
              placeholder="Flat 402, Royal Enclave, MG Road"
              value={formData.streetAddress}
              onChange={handleChange}
              disabled={submitting}
              style={fieldErrors.streetAddress ? { borderColor: 'var(--color-rose)' } : {}}
            />
            {fieldErrors.streetAddress && (
              <span className="form-error">{fieldErrors.streetAddress}</span>
            )}
          </div>

          {/* Address Line 2 / Landmark (Optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="addressLine2">
              Apartment, Landmark, or Additional Details (Optional)
            </label>
            <input
              id="addressLine2"
              name="addressLine2"
              type="text"
              className="form-input"
              placeholder="Near City Garden / Opposite Heritage Gate"
              value={formData.addressLine2}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          {/* City, State, PIN code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="city">
                City *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                className="form-input"
                placeholder="Jaipur"
                value={formData.city}
                onChange={handleChange}
                disabled={submitting}
                style={fieldErrors.city ? { borderColor: 'var(--color-rose)' } : {}}
              />
              {fieldErrors.city && (
                <span className="form-error">{fieldErrors.city}</span>
              )}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="state">
                State *
              </label>
              <input
                id="state"
                name="state"
                type="text"
                required
                className="form-input"
                placeholder="Rajasthan"
                value={formData.state}
                onChange={handleChange}
                disabled={submitting}
                style={fieldErrors.state ? { borderColor: 'var(--color-rose)' } : {}}
              />
              {fieldErrors.state && (
                <span className="form-error">{fieldErrors.state}</span>
              )}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="postalCode">
                PIN Code *
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                required
                maxLength={6}
                className="form-input"
                placeholder="302001"
                value={formData.postalCode}
                onChange={handleChange}
                disabled={submitting}
                style={fieldErrors.postalCode ? { borderColor: 'var(--color-rose)' } : {}}
              />
              {fieldErrors.postalCode && (
                <span className="form-error">{fieldErrors.postalCode}</span>
              )}
            </div>
          </div>

          {/* Save as default address checkbox */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer'
            }}
            onClick={() => setSaveAsDefault(!saveAsDefault)}
          >
            <input
              type="checkbox"
              id="saveAsDefaultCheckout"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--color-terracotta)',
                cursor: 'pointer'
              }}
            />
            <label
              htmlFor="saveAsDefaultCheckout"
              style={{
                fontSize: '0.88rem',
                cursor: 'pointer',
                color: 'var(--color-text-main)',
                userSelect: 'none'
              }}
            >
              Save this address as my default address in Personal Space
            </label>
          </div>

          {/* Order Summary & Terms */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            marginBottom: '1.5rem',
            fontSize: '0.88rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Artwork Acquisition:</span>
              <span>₹{painting.price?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Archival Transit & Insurance:</span>
              <span style={{ color: 'var(--color-olive)', fontWeight: 600 }}>Complimentary</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px dashed var(--color-border)',
              paddingTop: '0.6rem',
              fontWeight: 700,
              fontSize: '1.05rem',
              color: 'var(--color-text-main)'
            }}>
              <span>Total Payable:</span>
              <span style={{ color: 'var(--color-terracotta)' }}>₹{painting.price?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary"
              style={{ minWidth: '100px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !!successMessage}
              className="btn btn-primary"
              style={{ minWidth: '170px' }}
            >
              {submitting ? 'Placing Order...' : 'Confirm Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
