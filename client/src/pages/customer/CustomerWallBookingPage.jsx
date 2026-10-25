import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { wallBookingApi } from '../../api/wallBookingApi.js';
import {
  Brush,
  Calendar,
  DollarSign,
  MapPin,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  ShieldAlert,
  Check,
  BookmarkCheck,
  ArrowRight
} from 'lucide-react';

const formatDefaultAddress = (addr, usr) => {
  if (!addr || !addr.streetAddress) return '';
  const parts = [
    addr.streetAddress,
    addr.addressLine2,
    addr.city,
    addr.state ? `${addr.state} - ${addr.postalCode || ''}` : addr.postalCode,
    `(Contact: ${addr.fullName || usr?.name || ''}, ${addr.phone || usr?.phone || ''})`
  ].filter(Boolean);
  return parts.join(', ');
};

const MURAL_DESIGNS = [
  {
    id: 'traditional-warli',
    name: 'Traditional Warli & Folk Murals',
    description: 'Ritualistic folk art featuring white rice-paste motifs of dancing circles, harvest ceremonies, and tribal life.',
    previewImage: '/images/p-002.jpg'
  },
  {
    id: 'nature-botanical',
    name: 'Nature & Botanical',
    description: 'Lush flora, creeping vines, and delicate blooms rendered with earthy mineral tones to bring the outdoors in.',
    previewImage: '/images/p-005.jpg'
  },
  {
    id: 'abstract-geometric',
    name: 'Abstract & Geometric',
    description: 'Modern architectural lines, rhythmic Indian symmetry, and balanced polychromatic shapes.',
    previewImage: '/images/p-006.jpg'
  },
  {
    id: 'mandala-decorative',
    name: 'Mandala & Decorative Art',
    description: 'Sacred circular geometric patterns, meditative radial symmetry, and intricate celebratory borders.',
    previewImage: '/images/p-001.jpg'
  },
  {
    id: 'landscape-scenic',
    name: 'Landscape & Scenic Murals',
    description: 'Expansive panoramic countryside vistas, monsoon skies, riverbanks, and serene village horizons.',
    previewImage: '/images/p-012.jpg'
  },
  {
    id: 'kids-room',
    name: "Kids' Room Murals",
    description: 'Playful folklore creatures, whimsical elephants, stars, and colorful storytelling motifs for children.',
    previewImage: '/images/p-008.jpg'
  }
];

export const CustomerWallBookingPage = () => {
  const { user, refreshUser } = useAuth();
  const [designs, setDesigns] = useState(MURAL_DESIGNS);
  const [selectedDesignId, setSelectedDesignId] = useState('traditional-warli');
  const [bookingDate, setBookingDate] = useState('');
  const [wallSize, setWallSize] = useState(100);
  const [address, setAddress] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [rate, setRate] = useState(150);
  const [bookedDates, setBookedDates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  // Allowed booking window: 7 to 90 days from today
  const today = new Date();
  const minD = new Date(today);
  minD.setDate(today.getDate() + 7);
  const minDateStr = minD.toISOString().split('T')[0];

  const maxD = new Date(today);
  maxD.setDate(today.getDate() + 90);
  const maxDateStr = maxD.toISOString().split('T')[0];

  const defaultFormatted = formatDefaultAddress(user?.defaultAddress, user);
  const hasSavedDefault = !!defaultFormatted;
  const isAddressModified = hasSavedDefault && address.trim() !== defaultFormatted.trim();

  useEffect(() => {
    if (defaultFormatted) {
      setAddress(defaultFormatted);
      setSaveAsDefault(false);
    } else {
      setSaveAsDefault(true);
    }
  }, [defaultFormatted]);

  useEffect(() => {
    if (typeof wallBookingApi.getWallRate === 'function') {
      wallBookingApi.getWallRate()
        .then((res) => {
          if (res && res.ratePerSqFt) setRate(res.ratePerSqFt);
        })
        .catch(() => {});
    }

    if (typeof wallBookingApi.getMuralDesigns === 'function') {
      wallBookingApi.getMuralDesigns()
        .then((res) => {
          if (res && res.designs && Array.isArray(res.designs) && res.designs.length > 0) {
            setDesigns(res.designs);
          }
        })
        .catch(() => {});
    }

    if (typeof wallBookingApi.getBookedDates === 'function') {
      wallBookingApi.getBookedDates()
        .then((res) => {
          if (res && res.bookedDates) {
            setBookedDates(res.bookedDates.map((b) => b.date));
          }
        })
        .catch(() => {});
    }
  }, []);

  const selectedDesignObj = designs.find((d) => d.id === selectedDesignId) || designs[0];
  const totalPrice = wallSize * rate;
  const isDateUnavailable = bookedDates.includes(bookingDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedDesignId) {
      setError('Please select a mural design before submitting your booking.');
      return;
    }

    if (!bookingDate) {
      setError('Please choose a scheduled mural date.');
      return;
    }

    if (isDateUnavailable) {
      setError(`Date ${bookingDate} is already reserved by another client. Please select another calendar date.`);
      return;
    }

    if (wallSize < 10 || wallSize > 500) {
      setError('Wall size must be between 10 and 500 square feet.');
      return;
    }

    if (!address.trim()) {
      setError('Please enter the service location address.');
      return;
    }

    try {
      setSubmitting(true);
      await wallBookingApi.createBooking({
        bookingDate,
        wallSize: Number(wallSize),
        address: address.trim(),
        designId: selectedDesignId,
        saveAsDefault
      });
      if (saveAsDefault && refreshUser) {
        try {
          await refreshUser();
        } catch (e) {
          // ignore
        }
      }
      setSuccess('Your wall painting booking request has been submitted successfully! Our studio coordinator will review it.');
      setTimeout(() => {
        navigate('/customer/wall-bookings');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit wall booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1080px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="editorial-tag editorial-tag-terracotta" style={{ marginBottom: '0.75rem' }}>
          <Sparkles size={14} /> Bespoke Architectural Murals
        </div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          Book a Wall Painting Mural
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.02rem', lineHeight: 1.6 }}>
          Commission master folk artists to hand-paint classical murals directly on your living room, office, or dining wall at a flat, transparent rate.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--color-rose-light)',
          border: '1px solid var(--color-rose-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-rose)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <AlertCircle size={20} />
          <span style={{ fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--color-olive-light)',
          border: '1px solid var(--color-olive-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-olive)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 600 }}>{success}</span>
        </div>
      )}

      {/* Feature 1: Selectable Wall Mural Designs Gallery */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              1. Select Mural Design Style *
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              Choose one of our six signature architectural mural styles. Our master artisans hand-paint each artwork on site.
            </p>
          </div>
          <span className="badge badge-placed" style={{ fontSize: '0.8rem' }}>
            <Brush size={12} /> {designs.length} Signature Styles Available
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem'
        }}>
          {designs.map((design) => {
            const isSelected = selectedDesignId === design.id;
            return (
              <div
                key={design.id}
                onClick={() => setSelectedDesignId(design.id)}
                className="card"
                style={{
                  padding: '0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--color-terracotta)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-bg-card)' : 'var(--color-bg-subtle)',
                  boxShadow: isSelected ? '0 0 0 1px var(--color-terracotta), var(--shadow-md)' : 'var(--shadow-sm)',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                  <img
                    src={design.previewImage}
                    alt={design.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/favicon.svg';
                    }}
                  />
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'var(--color-terracotta)',
                      color: '#ffffff',
                      padding: '0.3rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      <Check size={14} /> Selected Style
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.15rem',
                    marginBottom: '0.45rem',
                    color: isSelected ? 'var(--color-terracotta)' : 'var(--color-text-main)'
                  }}>
                    {design.name}
                  </h3>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.55,
                    marginBottom: '1.25rem',
                    flex: 1
                  }}>
                    {design.description}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDesignId(design.id);
                    }}
                    className={isSelected ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      justifyContent: 'center',
                      fontWeight: 600
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check size={15} /> Selected Design
                      </>
                    ) : (
                      'Select Design'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Booking Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>2. Schedule & Location Details</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Specify the installation address and wall dimensions.
            </p>
          </div>

          {/* Selected Design Indicator */}
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-terracotta-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <img
                src={selectedDesignObj.previewImage}
                alt={selectedDesignObj.name}
                style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/favicon.svg';
                }}
              />
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-light)', fontWeight: 600 }}>
                  Selected Mural Style
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                  {selectedDesignObj.name}
                </div>
              </div>
            </div>
            <span className="badge badge-placed" style={{ fontSize: '0.75rem' }}>Active Choice</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Booking Date */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" htmlFor="bookingDate" style={{ fontSize: '0.95rem' }}>
                Scheduled Mural Date
              </label>
              <input
                id="bookingDate"
                type="date"
                min={minDateStr}
                max={maxDateStr}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
                className="form-input"
                style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
              />
              <span className="form-hint">
                Dates must be between 7 and 90 days from today (Earliest: <strong>{minDateStr}</strong>).
              </span>
              {isDateUnavailable && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-rose)', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 600 }}>
                  <AlertCircle size={15} />
                  <span>This calendar date is already reserved by another client. Please choose another date.</span>
                </div>
              )}
            </div>

            {/* Wall Size Range & Number */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" htmlFor="wallSize" style={{ fontSize: '0.95rem' }}>
                  Wall Surface Area (Square Feet)
                </label>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-terracotta)' }}>
                  {wallSize} sq.ft
                </span>
              </div>
              <input
                id="wallSize"
                type="range"
                min={10}
                max={500}
                step={5}
                value={wallSize}
                onChange={(e) => setWallSize(Number(e.target.value))}
                style={{ width: '100%', margin: '0.6rem 0', accentColor: 'var(--color-terracotta)' }}
              />
              <input
                type="number"
                min={10}
                max={500}
                value={wallSize}
                onChange={(e) => setWallSize(Number(e.target.value))}
                className="form-input"
                style={{ fontSize: '1.05rem', padding: '0.75rem 1rem' }}
              />
              <span className="form-hint">Permitted studio project size: 10 to 500 sq.ft.</span>
            </div>

            {/* Service Location */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.4rem',
                flexWrap: 'wrap',
                gap: '0.4rem'
              }}>
                <label className="form-label" htmlFor="address" style={{ fontSize: '0.95rem', margin: 0 }}>
                  Service Address & Landmark *
                </label>
                {hasSavedDefault ? (
                  isAddressModified ? (
                    <span className="badge badge-placed" title="This address differs from your saved default">
                      <MapPin size={11} /> Booking-Specific Address (Modified)
                    </span>
                  ) : (
                    <span className="badge badge-available" title="Prefilled from Personal Space">
                      <BookmarkCheck size={11} /> Prefilled Default Address
                    </span>
                  )
                ) : null}
              </div>

              {!hasSavedDefault && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  <span>No default address saved yet. You can enter the mural location below.</span>
                  <Link
                    to="/customer/profile"
                    target="_blank"
                    style={{
                      color: 'var(--color-terracotta)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                  >
                    Personal Space <ArrowRight size={12} />
                  </Link>
                </div>
              )}

              <textarea
                id="address"
                rows={3}
                required
                className="form-textarea"
                placeholder="Apartment 4B, Sunrise Enclave, Sector 14, Jaipur, Rajasthan"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Save as default address checkbox */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1.75rem',
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
                id="saveAsDefaultWall"
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
                htmlFor="saveAsDefaultWall"
                style={{
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  color: 'var(--color-text-main)',
                  userSelect: 'none'
                }}
              >
                Save this service address as my default address in Personal Space
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || isDateUnavailable}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            >
              <Brush size={18} />
              {submitting ? 'Submitting Reservation...' : 'Submit Mural Booking Request'}
            </button>
          </form>
        </div>

        {/* Right Column: Inspiration Visual & Authoritative Price Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Dynamic Inspiration Visual Card */}
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            backgroundColor: 'var(--color-bg-card)'
          }}>
            <div style={{ position: 'relative', height: '210px' }}>
              <img
                src={selectedDesignObj.previewImage}
                alt={selectedDesignObj.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/favicon.svg';
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1rem',
                background: 'linear-gradient(to top, rgba(41,36,31,0.9), transparent)',
                color: '#FCF9F4'
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedDesignObj.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#D5CCC0' }}>Natural mineral pigments hand-painted directly on your wall</div>
              </div>
            </div>
            <div style={{ padding: '1.25rem', fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              {selectedDesignObj.description} All organic pigments, preparatory primers, scaffold equipment, and final protective sealants are included.
            </div>
          </div>

          {/* Transparent Price Breakdown */}
          <div className="card" style={{ backgroundColor: 'var(--color-bg-subtle)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.6rem' }}>
              Transparent Price Breakdown
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Selected Mural Style</span>
              <strong style={{ color: 'var(--color-terracotta)' }}>{selectedDesignObj.name}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Mural Wall Surface</span>
              <strong>{wallSize} sq.ft</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Studio Rate per Sq.Ft</span>
              <strong>₹{rate}/sq.ft</strong>
            </div>

            <div style={{
              borderTop: '2px dashed var(--color-border)',
              margin: '1.25rem 0',
              paddingTop: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                  Estimated Total
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  ({wallSize} sq.ft × ₹{rate}/sq.ft)
                </span>
              </div>
              <span style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--color-terracotta)' }}>
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              * Strictly verified transparent calculation. Includes all natural pigments, brushes, scaffold arrangements, and artist honorariums.
            </p>
          </div>

          {/* Cancellation Policy Banner */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            gap: '0.85rem'
          }}>
            <Info size={22} color="var(--color-terracotta)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              <strong>Cancellation Policy:</strong> You may cancel this booking at no charge until <strong>3 days</strong> prior to the scheduled date. Due to artist travel scheduling, bookings within 3 days cannot be cancelled.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
