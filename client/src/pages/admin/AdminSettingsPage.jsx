import React, { useEffect, useState } from 'react';
import { wallBookingApi } from '../../api/wallBookingApi.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.jsx';
import {
  Settings,
  DollarSign,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  Brush,
  Calculator
} from 'lucide-react';

export const AdminSettingsPage = () => {
  const [currentRate, setCurrentRate] = useState(150);
  const [inputRate, setInputRate] = useState('150');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Simulator
  const [simSqFt, setSimSqFt] = useState(100);

  const fetchRate = async () => {
    try {
      setLoading(true);
      const data = await wallBookingApi.getMuralRateAdmin();
      if (data && data.ratePerSqFt) {
        setCurrentRate(data.ratePerSqFt);
        setInputRate(String(data.ratePerSqFt));
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to load studio configuration.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const numericRate = Number(inputRate);
    if (isNaN(numericRate) || numericRate < 10) {
      setFeedback({
        type: 'error',
        text: 'Mural rate must be a valid number of at least ₹10 per sq.ft.'
      });
      return;
    }

    if (numericRate > 10000) {
      setFeedback({
        type: 'error',
        text: 'Mural rate cannot exceed ₹10,000 per sq.ft.'
      });
      return;
    }

    try {
      setSaving(true);
      const res = await wallBookingApi.updateMuralRateAdmin(numericRate);
      setCurrentRate(res.ratePerSqFt || numericRate);
      setFeedback({
        type: 'success',
        text: `Mural rate updated to ₹${res.ratePerSqFt || numericRate} per sq.ft successfully. All newly submitted customer bookings will use this rate.`
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update mural rate.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading studio settings..." />;

  const activeRateNumber = Number(inputRate) || currentRate;
  const simulatedPrice = simSqFt * activeRateNumber;

  return (
    <div style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>Studio Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
          Configure studio baseline rates, service pricing parameters, and operational policies.
        </p>
      </div>

      {feedback && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: feedback.type === 'success' ? 'var(--color-olive-light)' : 'var(--color-rose-light)',
          color: feedback.type === 'success' ? 'var(--color-olive)' : 'var(--color-rose)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--color-olive-border)' : 'var(--color-rose-border)'}`,
          boxShadow: 'var(--shadow-sm)'
        }}>
          {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{feedback.text}</span>
        </div>
      )}

      {/* Mural Pricing Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-terracotta-light)',
            color: 'var(--color-terracotta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brush size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 700 }}>
              Mural Pricing
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
              Official per-square-foot commission fee for client wall painting bookings.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.75rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
                Current Mural Rate
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-terracotta)' }}>
                ₹{currentRate} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/ sq.ft</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Currently active for all new customer requests
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="newMuralRate" style={{ fontSize: '0.92rem' }}>
                Configure New Rate (₹ per sq.ft) *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', color: 'var(--color-text-light)', fontWeight: 700, fontSize: '1.1rem' }}>
                  ₹
                </span>
                <input
                  id="newMuralRate"
                  type="number"
                  min={10}
                  max={10000}
                  step={5}
                  required
                  value={inputRate}
                  onChange={(e) => setInputRate(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '32px', fontSize: '1.1rem', fontWeight: 600 }}
                  placeholder="e.g. 180"
                />
              </div>
              <span className="form-hint">
                Accepted range: ₹10 to ₹10,000 per square foot.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={saving || Number(inputRate) === currentRate}
              className="btn btn-primary"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
            >
              <Save size={18} />
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
            {Number(inputRate) === currentRate && (
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                No changes pending (current rate is ₹{currentRate}/sq.ft).
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Live Calculation Preview Simulator */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'var(--color-bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Calculator size={18} color="var(--color-terracotta)" />
          <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
            Live Mural Price Simulator
          </h3>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Simulate how customer quotes are calculated based on wall surface area and the configured rate:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <label className="form-label" htmlFor="simSqFtInput" style={{ fontSize: '0.85rem' }}>
              Sample Wall Size ({simSqFt} sq.ft)
            </label>
            <input
              id="simSqFtInput"
              type="range"
              min={10}
              max={500}
              step={10}
              value={simSqFt}
              onChange={(e) => setSimSqFt(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-terracotta)' }}
            />
          </div>

          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-light)', fontWeight: 600 }}>
                Estimated Total Quote
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {simSqFt} sq.ft × ₹{activeRateNumber}/sq.ft
              </div>
            </div>
            <strong style={{ fontSize: '1.6rem', color: 'var(--color-terracotta)' }}>
              ₹{simulatedPrice.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>
      </div>

      {/* Operational Policy Notes */}
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
          <strong>Policy Note:</strong> The configured mural rate is dynamically queried on customer booking forms. When an administrator updates the rate, all future booking requests immediately calculate quotes using the new rate. Existing confirmed and requested bookings preserve their historical agreed price snapshot.
        </div>
      </div>
    </div>
  );
};
