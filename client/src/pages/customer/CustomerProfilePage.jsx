import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { profileApi } from '../../api/profileApi.js';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  ShoppingBag,
  Brush,
  Coffee,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const CustomerProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { themeMode, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    fullName: '',
    recipientPhone: '',
    streetAddress: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Populate from authenticated user
  const populateFields = (userData) => {
    if (!userData) return;
    setFormData({
      name: userData.name || '',
      phone: userData.phone || '',
      fullName: userData.defaultAddress?.fullName || userData.name || '',
      recipientPhone: userData.defaultAddress?.phone || userData.phone || '',
      streetAddress: userData.defaultAddress?.streetAddress || '',
      addressLine2: userData.defaultAddress?.addressLine2 || '',
      city: userData.defaultAddress?.city || '',
      state: userData.defaultAddress?.state || '',
      postalCode: userData.defaultAddress?.postalCode || ''
    });
  };

  useEffect(() => {
    if (user) {
      populateFields(user);
    }
  }, [user]);

  // Initials generator
  const getInitials = (nameStr) => {
    if (!nameStr) return 'K';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Profile Completeness calculation based on meaningful fields
  const calculateCompleteness = () => {
    const fields = [
      { key: 'name', value: formData.name },
      { key: 'phone', value: formData.phone },
      { key: 'streetAddress', value: formData.streetAddress },
      { key: 'city', value: formData.city },
      { key: 'state', value: formData.state },
      { key: 'postalCode', value: formData.postalCode }
    ];
    const completed = fields.filter((f) => f.value && f.value.trim().length > 0).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completenessPercentage = calculateCompleteness();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }

    const indianMobileRegex = /^(?:\+91[\-\s]?)?[0]?[6-9]\d{9}$/;
    if (formData.phone && !indianMobileRegex.test(formData.phone.trim())) {
      errors.phone = 'Please provide a valid 10-digit Indian mobile number';
    }

    // Default address validation: if any address field is filled, required fields must be validated
    const hasAddressInput =
      formData.streetAddress ||
      formData.city ||
      formData.state ||
      formData.postalCode ||
      formData.recipientPhone;

    if (hasAddressInput) {
      if (!formData.fullName.trim()) {
        errors.fullName = 'Recipient name is required for delivery';
      }
      if (!formData.recipientPhone.trim()) {
        errors.recipientPhone = 'Delivery contact number is required';
      } else if (!indianMobileRegex.test(formData.recipientPhone.trim())) {
        errors.recipientPhone = 'Please provide a valid 10-digit Indian contact number';
      }
      if (!formData.streetAddress.trim()) {
        errors.streetAddress = 'Street address is required';
      }
      if (!formData.city.trim()) {
        errors.city = 'City is required';
      }
      if (!formData.state.trim()) {
        errors.state = 'State is required';
      }
      const indianPinRegex = /^[1-9][0-9]{5}$/;
      if (!formData.postalCode.trim()) {
        errors.postalCode = 'PIN code is required';
      } else if (!indianPinRegex.test(formData.postalCode.trim())) {
        errors.postalCode = 'PIN code must be a valid 6-digit Indian postal code';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) {
      setErrorMessage('Please correct the highlighted fields before saving.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim()
      };

      const hasAddress =
        formData.streetAddress.trim() ||
        formData.city.trim() ||
        formData.state.trim() ||
        formData.postalCode.trim();

      if (hasAddress) {
        payload.defaultAddress = {
          fullName: (formData.fullName || formData.name).trim(),
          phone: (formData.recipientPhone || formData.phone).trim(),
          streetAddress: formData.streetAddress.trim(),
          addressLine2: formData.addressLine2 ? formData.addressLine2.trim() : '',
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim()
        };
      }

      await updateProfile(payload);
      setSuccessMessage('Your profile and default address were saved successfully.');
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    populateFields(user);
    setFormErrors({});
    setSuccessMessage('');
    setErrorMessage('');
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : 'Art Enthusiast';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="editorial-tag editorial-tag-terracotta">
            <UserIcon size={13} /> Personal Space
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>My Account Hub</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Manage your personal details, default delivery address, and studio appearance.
        </p>
      </div>

      {/* Success & Error Banners */}
      {successMessage && (
        <div
          style={{
            backgroundColor: 'var(--color-olive-light)',
            border: '1px solid var(--color-olive-border)',
            color: 'var(--color-olive)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.95rem'
          }}
        >
          <CheckCircle2 size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            backgroundColor: 'var(--color-rose-light)',
            border: '1px solid var(--color-rose-border)',
            color: 'var(--color-rose)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.95rem'
          }}
        >
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION A: Profile Overview Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Initials Avatar */}
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-terracotta)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                boxShadow: 'var(--shadow-md)',
                flexShrink: 0
              }}
            >
              {getInitials(user?.name)}
            </div>

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>
                {user?.name || 'Studio Collector'}
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.88rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} /> {user?.email}
                </span>
                {user?.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} /> {user.phone}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)'
            }}
          >
            <ShieldCheck size={16} color="var(--color-olive)" />
            <span>Verified Customer Account</span>
          </div>
        </div>

        {/* Profile Completeness Bar */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
              fontSize: '0.85rem'
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={14} color="var(--color-terracotta)" /> Profile Completeness
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {completenessPercentage}% Complete
            </span>
          </div>
          <div
            style={{
              height: '8px',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)'
            }}
          >
            <div
              style={{
                width: `${completenessPercentage}%`,
                height: '100%',
                backgroundColor:
                  completenessPercentage === 100
                    ? 'var(--color-olive)'
                    : 'var(--color-terracotta)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
            Saving your contact phone and default address enables instantaneous checkout for paintings and wall mural bookings. (All optional fields remain voluntary).
          </p>
        </div>
      </div>

      {/* SECTION B & C: Personal Details & Default Address Form */}
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <UserIcon size={20} color="var(--color-terracotta)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Personal Information</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="name">
                Full Name <span style={{ color: 'var(--color-rose)' }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Sricharan V"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
              />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>

            {/* Contact Phone */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="phone">
                Contact Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
              />
              <span className="form-hint">10-digit Indian mobile number</span>
              {formErrors.phone && <div className="form-error">{formErrors.phone}</div>}
            </div>

            {/* Email (Protected Login Identifier) */}
            <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
              <label className="form-label" htmlFor="email">
                Registered Email (Login Identifier)
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={user?.email || ''}
                readOnly
                disabled
                style={{
                  backgroundColor: 'var(--color-bg-subtle)',
                  cursor: 'not-allowed',
                  opacity: 0.85
                }}
              />
              <span className="form-hint">
                Email is tied to your login identity and security credentials. Contact studio support to update.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION C: Saved Default Address Card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={20} color="var(--color-terracotta)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Default Delivery & Service Address</h2>
            </div>
            <span className="badge badge-available">
              Prefilled at Checkout
            </span>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            This address will automatically prefill painting purchases and wall mural bookings. You can always override it for any individual order without affecting this default.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Recipient Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Recipient / Contact Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="form-input"
                placeholder="Name of recipient"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={loading}
              />
              {formErrors.fullName && <div className="form-error">{formErrors.fullName}</div>}
            </div>

            {/* Delivery Contact Mobile */}
            <div className="form-group">
              <label className="form-label" htmlFor="recipientPhone">
                Delivery Contact Mobile
              </label>
              <input
                id="recipientPhone"
                name="recipientPhone"
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={formData.recipientPhone}
                onChange={handleInputChange}
                disabled={loading}
              />
              {formErrors.recipientPhone && <div className="form-error">{formErrors.recipientPhone}</div>}
            </div>

            {/* Street Address */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="streetAddress">
                House / Flat No., Street, Area
              </label>
              <input
                id="streetAddress"
                name="streetAddress"
                type="text"
                className="form-input"
                placeholder="e.g. Flat 402, Lotus Residency, MG Road"
                value={formData.streetAddress}
                onChange={handleInputChange}
                disabled={loading}
              />
              {formErrors.streetAddress && <div className="form-error">{formErrors.streetAddress}</div>}
            </div>

            {/* Address Line 2 */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="addressLine2">
                Apartment, Landmark, or Additional Info (Optional)
              </label>
              <input
                id="addressLine2"
                name="addressLine2"
                type="text"
                className="form-input"
                placeholder="e.g. Near Art Gallery Circle"
                value={formData.addressLine2}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            {/* City */}
            <div className="form-group">
              <label className="form-label" htmlFor="city">
                City / Town
              </label>
              <input
                id="city"
                name="city"
                type="text"
                className="form-input"
                placeholder="e.g. Jaipur"
                value={formData.city}
                onChange={handleInputChange}
                disabled={loading}
              />
              {formErrors.city && <div className="form-error">{formErrors.city}</div>}
            </div>

            {/* State */}
            <div className="form-group">
              <label className="form-label" htmlFor="state">
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                className="form-input"
                placeholder="e.g. Rajasthan"
                value={formData.state}
                onChange={handleInputChange}
                disabled={loading}
              />
              {formErrors.state && <div className="form-error">{formErrors.state}</div>}
            </div>

            {/* Indian PIN Code */}
            <div className="form-group">
              <label className="form-label" htmlFor="postalCode">
                6-Digit PIN Code
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                className="form-input"
                maxLength={6}
                placeholder="e.g. 302001"
                value={formData.postalCode}
                onChange={handleInputChange}
                disabled={loading}
              />
              {formErrors.postalCode && <div className="form-error">{formErrors.postalCode}</div>}
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--color-border)'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw size={16} /> Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Save size={16} /> {loading ? 'Saving Changes...' : 'Save Profile & Address'}
            </button>
          </div>
        </div>
      </form>

      {/* SECTION D: Appearance & Theme Selector */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Sun size={20} color="var(--color-terracotta)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Studio Appearance</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Select how you prefer KalaKriti to look. Your choice applies instantly and is saved to your account.
        </p>

        <div className="theme-selector-grid">
          {/* Light Theme Option */}
          <div
            className={`theme-card-option ${themeMode === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
            role="button"
            tabIndex={0}
            aria-label="Select Light Theme"
          >
            <div
              className="theme-mini-preview"
              style={{ backgroundColor: '#FCF9F4', border: '1px solid #E5DDD1' }}
            >
              <div style={{ width: '30%', backgroundColor: '#F2E9DE' }} />
              <div style={{ flex: 1, padding: '4px' }}>
                <div style={{ width: '60%', height: '6px', backgroundColor: '#C9572B', borderRadius: '2px', marginBottom: '4px' }} />
                <div style={{ width: '80%', height: '4px', backgroundColor: '#29241F', borderRadius: '2px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.92rem' }}>
              <Sun size={16} color="var(--color-terracotta)" /> Light Theme
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Gallery Ivory & Sand</span>
          </div>

          {/* Dark Theme Option */}
          <div
            className={`theme-card-option ${themeMode === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
            role="button"
            tabIndex={0}
            aria-label="Select Dark Theme"
          >
            <div
              className="theme-mini-preview"
              style={{ backgroundColor: '#181512', border: '1px solid #3A322B' }}
            >
              <div style={{ width: '30%', backgroundColor: '#231E19' }} />
              <div style={{ flex: 1, padding: '4px' }}>
                <div style={{ width: '60%', height: '6px', backgroundColor: '#E26E40', borderRadius: '2px', marginBottom: '4px' }} />
                <div style={{ width: '80%', height: '4px', backgroundColor: '#FAF6F0', borderRadius: '2px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.92rem' }}>
              <Moon size={16} color="var(--color-terracotta)" /> Dark Theme
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Deep Artisan Charcoal</span>
          </div>

          {/* System Theme Option */}
          <div
            className={`theme-card-option ${themeMode === 'system' ? 'active' : ''}`}
            onClick={() => setTheme('system')}
            role="button"
            tabIndex={0}
            aria-label="Select System Theme"
          >
            <div
              className="theme-mini-preview"
              style={{
                background: 'linear-gradient(135deg, #FCF9F4 50%, #181512 50%)',
                border: '1px solid var(--color-border)'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.92rem' }}>
              <Laptop size={16} color="var(--color-terracotta)" /> System Preference
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Matches Device Setting</span>
          </div>
        </div>
      </div>

      {/* SECTION E: Quick Activity Shortcuts */}
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>
          My Studio Activity
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Link
            to="/customer/orders"
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'var(--color-bg-subtle)'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-terracotta-light)',
                color: 'var(--color-terracotta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShoppingBag size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Purchased Paintings</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>View delivery snapshots</div>
            </div>
          </Link>

          <Link
            to="/customer/wall-bookings"
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'var(--color-bg-subtle)'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-olive-light)',
                color: 'var(--color-olive)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Brush size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Wall Murals</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Manage site bookings</div>
            </div>
          </Link>

          <Link
            to="/customer/pottery-requests"
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'var(--color-bg-subtle)'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-ochre-light)',
                color: 'var(--color-ochre)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Coffee size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Custom Pottery</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Track handcrafted vessels</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
