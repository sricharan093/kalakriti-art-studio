import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { potteryApi } from '../../api/potteryApi.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import { PotteryPhotoViewer } from '../../components/PotteryPhotoViewer.jsx';
import { POTTERY_ITEMS, GLAZE_DETAILS } from '../../data/potteryImages.js';
import { Coffee, Calendar, AlertCircle, CheckCircle, Sparkles, Layers, ShieldCheck } from 'lucide-react';

// Glaze color mapping for authentic Indian mineral glazes
const GLAZE_COLORS = {
  'g-01': '#A62B2B', // Kumkum Red
  'g-02': '#D99B26', // Haldi Yellow
  'g-03': '#4D6B3C', // Mehendi Green
  'g-04': '#2B4A78', // Indigo Blue
  'g-05': '#C7A882', // Sandalwood Beige
  'g-06': '#2E2A27'  // Charcoal Black
};

// Tasteful SVG previews for pottery forms (Kulhad, Surahi, Matka, Diya, Gamla)
const renderPotteryFormSvg = (itemId, color = 'var(--color-terracotta)') => {
  switch (itemId) {
    case 'i-01': // Kulhad
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="24" cy="12" rx="14" ry="4" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2" />
          <path d="M10 12 L14 40 C14 42 34 42 34 40 L38 12" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
          <line x1="12" y1="20" x2="36" y2="20" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    case 'i-02': // Surahi
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 8 L27 8 L27 18 C33 22 36 28 36 34 C36 41 31 43 24 43 C17 43 12 41 12 34 C12 28 15 22 21 18 Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
          <ellipse cx="24" cy="8" rx="3.5" ry="1.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.3" />
        </svg>
      );
    case 'i-03': // Matka
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="24" cy="10" rx="9" ry="2.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.3" />
          <path d="M15 10 C10 16 7 24 7 30 C7 38 14 43 24 43 C34 43 41 38 41 30 C41 24 38 16 33 10" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
        </svg>
      );
    case 'i-04': // Diya set
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 28 C8 37 40 37 40 28 C40 25 36 25 24 25 C12 25 8 25 8 28 Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
          <path d="M24 10 C21 16 22 22 24 24 C26 22 27 16 24 10 Z" fill="#D99B26" stroke="#D99B26" strokeWidth="1.5" />
        </svg>
      );
    case 'i-05': // Gamla
    default:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 14 L38 14 L33 41 L15 41 Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
          <rect x="8" y="10" width="32" height="4" rx="2" fill={color} stroke={color} strokeWidth="1" />
        </svg>
      );
  }
};

export const CustomerPotteryRequestPage = () => {
  const [items, setItems] = useState([]);
  const [glazes, setGlazes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedGlazeId, setSelectedGlazeId] = useState('');
  const [quantity, setQuantity] = useState(2);
  const [neededByDate, setNeededByDate] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  // Earliest date is strictly 14 days from today
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 14);
  const minDateStr = minDate.toISOString().split('T')[0];

  useEffect(() => {
    potteryApi.getOptions()
      .then((res) => {
        setItems(res.items || []);
        setGlazes(res.glazes || []);
        if (res.items?.length) setSelectedItemId(res.items[0].id);
        if (res.glazes?.length) setSelectedGlazeId(res.glazes[0].id);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch pottery options');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedItemId) {
      setError('Please select a pottery item form.');
      return;
    }
    if (!selectedGlazeId) {
      setError('Please choose a mineral glaze finish.');
      return;
    }
    if (quantity < 1 || quantity > 12) {
      setError('Quantity must be between 1 and 12 pieces.');
      return;
    }
    if (!neededByDate) {
      setError('Please choose a needed-by date (at least 14 days from today).');
      return;
    }

    try {
      setSubmitting(true);
      await potteryApi.createRequest({
        itemId: selectedItemId,
        glazeId: selectedGlazeId,
        quantity: Number(quantity),
        neededByDate,
        notes: notes.trim()
      });
      setSuccess('Your bespoke pottery request has been placed! Our studio potter will review it.');
      setTimeout(() => {
        navigate('/customer/pottery-requests');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit pottery request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching authentic studio pottery catalogue & mineral glazes..." />;

  const selectedItemObj = items.find((i) => i.id === selectedItemId);
  const selectedGlazeObj = glazes.find((g) => g.id === selectedGlazeId);
  const activeGlazeColor = GLAZE_COLORS[selectedGlazeId] || 'var(--color-terracotta)';

  return (
    <div style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="editorial-tag editorial-tag-terracotta" style={{ marginBottom: '0.75rem' }}>
          <Sparkles size={14} /> Hand-Turned Studio Ceramics
        </div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          Commission Custom Studio Pottery
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.02rem', lineHeight: 1.6 }}>
          Hand-thrown river clay turned on traditional pottery wheels, cured with gentle air drying, biscuit fired, and glazed in natural mineral finishes.
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
        {/* Main Request Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Step 1: Pottery Form Selector */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                1. Select Pottery Form
              </label>
              <div className="pottery-items-grid">
                {items.map((item) => {
                  const isSelected = item.id === selectedItemId;
                  const itemConfig = POTTERY_ITEMS[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItemId(item.id)}
                      className={`pottery-item-card ${isSelected ? 'selected' : ''}`}
                      aria-pressed={isSelected}
                      title={item.name}
                    >
                      {itemConfig?.thumbnail ? (
                        <img
                          src={itemConfig.thumbnail}
                          alt={item.name}
                          className="pottery-card-thumb"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{ marginBottom: '0.5rem' }}>
                          {renderPotteryFormSvg(item.id, isSelected ? 'var(--color-terracotta)' : '#6E665D')}
                        </div>
                      )}
                      <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--color-terracotta)' : 'var(--color-text-main)' }}>
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Mineral Glaze Swatches */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                2. Select Natural Mineral Glaze
              </label>
              <div className="glaze-grid">
                {glazes.map((glaze) => {
                  const isSelected = glaze.id === selectedGlazeId;
                  const colorHex = GLAZE_COLORS[glaze.id] || '#8C7E72';
                  return (
                    <button
                      key={glaze.id}
                      type="button"
                      onClick={() => setSelectedGlazeId(glaze.id)}
                      className={`glaze-swatch-card ${isSelected ? 'selected' : ''}`}
                      aria-pressed={isSelected}
                      title={glaze.name}
                    >
                      <div
                        className="glaze-color-circle"
                        style={{ backgroundColor: colorHex }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--color-terracotta)' : 'var(--color-text-main)' }}>
                        {glaze.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Quantity */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="quantity" style={{ fontSize: '0.95rem' }}>
                  3. Batch Quantity (1 to 12 pieces)
                </label>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-terracotta)' }}>
                  {quantity} {quantity === 1 ? 'piece' : 'pieces'}
                </span>
              </div>
              <input
                id="quantity"
                type="number"
                min={1}
                max={12}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="form-input"
                style={{ fontSize: '1.05rem', padding: '0.75rem 1rem' }}
              />
              <span className="form-hint">
                Wheel-thrown artisan batches are limited to 12 units to guarantee uniform firing and glaze purity.
              </span>
            </div>

            {/* Step 4: Needed-by Date */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" htmlFor="neededByDate" style={{ fontSize: '0.95rem' }}>
                4. Needed-by Date
              </label>
              <input
                id="neededByDate"
                type="date"
                min={minDateStr}
                value={neededByDate}
                onChange={(e) => setNeededByDate(e.target.value)}
                required
                className="form-input"
                style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
              />
              <span className="form-hint">
                Requires at least 14 days for wheel shaping, slow drying, biscuit firing, and glaze kiln cooling. (Earliest: <strong>{minDateStr}</strong>).
              </span>
            </div>

            {/* Step 5: Custom Notes */}
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="notes" style={{ fontSize: '0.95rem' }}>
                5. Special Requests or Studio Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                className="form-textarea"
                placeholder="E.g., unglazed lip for drinking comfort, matte earthy texture, gift personalization..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            >
              <Coffee size={18} />
              {submitting ? 'Placing Studio Commission...' : 'Submit Custom Pottery Request'}
            </button>
          </form>
        </div>

        {/* Right Column: Live Photographic Customizer Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <PotteryPhotoViewer
            itemId={selectedItemId}
            glazeId={selectedGlazeId}
            itemName={selectedItemObj?.name}
            glazeName={selectedGlazeObj?.name}
            quantity={quantity}
            neededByDate={neededByDate}
          />

          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <ShieldCheck size={20} color="var(--color-olive)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              <strong>Lifecycle Rule:</strong> While your request status remains <code>requested</code>, you can edit dimensions or cancel anytime. Once our master potter reviews and accepts it into the firing queue, it is locked.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
