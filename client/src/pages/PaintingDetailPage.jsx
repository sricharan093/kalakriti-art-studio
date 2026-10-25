import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { paintingApi } from '../api/paintingApi.js';
import { orderApi } from '../api/orderApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { PaintingPurchaseModal } from '../components/PaintingPurchaseModal.jsx';
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle,
  ShieldCheck,
  Award,
  Tag,
  Sparkles,
  Info
} from 'lucide-react';

export const PaintingDetailPage = () => {
  const { id } = useParams();
  const [painting, setPainting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPainting = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paintingApi.getPaintingById(id);
      setPainting(data.painting);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPainting();
  }, [id]);

  const handleBuy = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/paintings/${id}` } } });
      return;
    }
    if (user.role !== 'CUSTOMER') {
      setActionMessage({ type: 'error', text: 'Admin accounts cannot purchase paintings. Please log in as a customer.' });
      return;
    }

    setActionMessage(null);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = (order) => {
    setActionMessage({
      type: 'success',
      text: 'Congratulations! You have purchased this painting. View your receipt and delivery details in My Orders.'
    });
    setIsPurchaseModalOpen(false);
    fetchPainting();
  };

  if (loading) return <LoadingSpinner message="Curating painting details from studio records..." />;
  if (error) return <div className="page-wrapper"><ErrorMessage message={error} onRetry={fetchPainting} /></div>;
  if (!painting) return null;

  const isSold = painting.status === 'sold';

  return (
    <div className="page-wrapper">
      {/* Return Link */}
      <Link
        to="/catalogue"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--color-text-muted)',
          marginBottom: '2rem',
          fontSize: '0.92rem',
          fontWeight: 600,
          transition: 'color 0.2s ease'
        }}
      >
        <ArrowLeft size={16} /> Back to Paintings Catalogue
      </Link>

      {/* Action banner feedback */}
      {actionMessage && (
        <div style={{
          padding: '1.1rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          backgroundColor: actionMessage.type === 'success' ? 'var(--color-olive-light)' : 'var(--color-rose-light)',
          color: actionMessage.type === 'success' ? 'var(--color-olive)' : 'var(--color-rose)',
          border: `1px solid ${actionMessage.type === 'success' ? 'var(--color-olive-border)' : 'var(--color-rose-border)'}`,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <CheckCircle size={22} />
          <span style={{ fontSize: '0.98rem', fontWeight: 600 }}>{actionMessage.text}</span>
        </div>
      )}

      {/* Luxury Two-Column Gallery Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '3.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Framed Artwork Presentation */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: 'var(--color-bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '440px'
            }}>
              <img
                src={`/${painting.imageUrl}`}
                alt={painting.title}
                style={{
                  width: '100%',
                  maxHeight: '560px',
                  objectFit: 'contain',
                  display: 'block',
                  filter: isSold ? 'grayscale(25%)' : 'none'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/favicon.svg';
                }}
              />
              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                <span className="one-of-a-kind-badge">One of a kind</span>
              </div>
              <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                <StatusBadge status={painting.status} />
              </div>
            </div>

            {/* Framing & Conservation Caption */}
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--color-text-light)'
            }}>
              <span>Artisan Signed & Verified</span>
              <span>Catalog Ref: {painting.id}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Artwork Details & Acquisition Card */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <span className="editorial-tag editorial-tag-terracotta">
              <Sparkles size={13} /> Original Indian Folk Canvas
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontFamily: 'monospace' }}>
              #{painting.id}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 4vw, 3rem)',
            lineHeight: 1.18,
            marginBottom: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-text-main)'
          }}>
            {painting.title}
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '1.1rem',
            color: 'var(--color-text-muted)',
            marginBottom: '2rem'
          }}>
            <span>Master Artisan:</span>
            <strong style={{ color: 'var(--color-text-main)', fontWeight: 700 }}>
              {painting.artist}
            </strong>
          </div>

          {/* Pricing & Acquisition Block */}
          <div style={{
            padding: '2rem',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            marginBottom: '2.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Gallery Acquisition Price
              </span>
              <StatusBadge status={painting.status} />
            </div>

            <div style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
              ₹{painting.price.toLocaleString('en-IN')}
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Direct acquisition includes signed studio provenance certificate, archival acid-free packaging, and insured transit within India.
            </p>

            {/* Action button */}
            {!isSold ? (
              <button
                onClick={handleBuy}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1.1rem', fontSize: '1.08rem', borderRadius: 'var(--radius-sm)' }}
              >
                <ShoppingCart size={20} />
                Acquire This Original Painting
              </button>
            ) : (
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'var(--color-rose-light)',
                border: '1px solid var(--color-rose-border)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                color: 'var(--color-rose)',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}>
                This one-of-a-kind artwork has been acquired by a collector and is no longer available for purchase.
              </div>
            )}
          </div>

          {/* Medium, Dimensions, and Artwork Narrative */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Artwork Narrative & Medium
            </h3>
            <p style={{
              color: 'var(--color-text-muted)',
              lineHeight: 1.8,
              fontSize: '1.02rem',
              whiteSpace: 'pre-line',
              marginBottom: '1.5rem'
            }}>
              {painting.description}
            </p>

            {(painting.category || painting.dimensions || painting.medium) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', padding: '1rem 1.25rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--color-border)', fontSize: '0.88rem' }}>
                {painting.category && (
                  <div>
                    <span style={{ color: 'var(--color-text-light)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Art Style</span>
                    <strong style={{ color: 'var(--color-text-main)' }}>{painting.category}</strong>
                  </div>
                )}
                {painting.dimensions && (
                  <div>
                    <span style={{ color: 'var(--color-text-light)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dimensions</span>
                    <strong style={{ color: 'var(--color-text-main)' }}>{painting.dimensions}</strong>
                  </div>
                )}
                {painting.medium && (
                  <div>
                    <span style={{ color: 'var(--color-text-light)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medium</span>
                    <strong style={{ color: 'var(--color-text-main)' }}>{painting.medium}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Studio Guarantees */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1rem',
            padding: '1.5rem',
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <ShieldCheck size={20} color="var(--color-olive)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text-main)' }}>Atomic Inventory System:</strong> Multiple customers can browse simultaneously, but exactly one verified order will be completed.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Award size={20} color="var(--color-terracotta)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text-main)' }}>Heritage Artisan Promise:</strong> Natural minerals, vegetal dyes, and traditional folk motifs authentic to the artist's region.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Purchase Modal with Delivery Address Collection */}
      <PaintingPurchaseModal
        isOpen={isPurchaseModalOpen}
        painting={painting}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  );
};
