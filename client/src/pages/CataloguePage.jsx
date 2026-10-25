import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { paintingApi } from '../api/paintingApi.js';
import { orderApi } from '../api/orderApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { PaintingPurchaseModal } from '../components/PaintingPurchaseModal.jsx';
import { Search, ShoppingCart, CheckCircle, AlertTriangle, Eye, Sparkles } from 'lucide-react';

export const CataloguePage = () => {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [purchasingPainting, setPurchasingPainting] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || '';

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPaintings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paintingApi.getPaintings(currentStatus);
      setPaintings(data.paintings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaintings();
  }, [currentStatus]);

  const handleBuy = (painting) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/catalogue' } } });
      return;
    }
    if (user.role !== 'CUSTOMER') {
      setActionMessage({ type: 'error', text: 'Admin accounts cannot purchase paintings. Please use a customer account.' });
      return;
    }
    setActionMessage(null);
    setPurchasingPainting(painting);
  };

  const handlePurchaseSuccess = (order) => {
    setActionMessage({
      type: 'success',
      text: `Congratulations! You have purchased "${purchasingPainting?.title}". View your receipt in My Orders.`
    });
    setPurchasingPainting(null);
    fetchPaintings();
  };

  const filteredPaintings = paintings.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  return (
    <div className="page-wrapper">
      {/* Editorial Header */}
      <div style={{ marginBottom: '3rem', maxWidth: '800px' }}>
        <div className="editorial-tag editorial-tag-terracotta" style={{ marginBottom: '1rem' }}>
          <Sparkles size={14} /> Curated Indian Fine Art
        </div>
        <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)', lineHeight: 1.15, marginBottom: '0.85rem' }}>
          Original Paintings Catalogue
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.08rem', lineHeight: 1.7 }}>
          Strictly one-of-a-kind canvases by master Indian folk artists. Every painting is backed by atomic single-collector registration, guaranteeing that no duplicate sales can ever occur.
        </p>
      </div>

      {/* Action banner feedback */}
      {actionMessage && (
        <div style={{
          padding: '1.1rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          backgroundColor: actionMessage.type === 'success' ? 'var(--color-olive-light)' : 'var(--color-rose-light)',
          color: actionMessage.type === 'success' ? 'var(--color-olive)' : 'var(--color-rose)',
          border: `1px solid ${actionMessage.type === 'success' ? 'var(--color-olive-border)' : 'var(--color-rose-border)'}`,
          boxShadow: 'var(--shadow-sm)'
        }}>
          {actionMessage.type === 'success' ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
          <span style={{ fontSize: '0.98rem', fontWeight: 600 }}>{actionMessage.text}</span>
        </div>
      )}

      {/* Controls: Search and Status Filter Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '2.75rem',
        flexWrap: 'wrap',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--color-border)'
      }}>
        {/* Status Filter Tabs */}
        <div style={{
          display: 'inline-flex',
          gap: '0.4rem',
          backgroundColor: 'var(--color-sand)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <button
            onClick={() => setSearchParams({})}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 600,
              backgroundColor: currentStatus === '' ? 'var(--color-bg-card)' : 'transparent',
              color: currentStatus === '' ? 'var(--color-terracotta)' : 'var(--color-text-muted)',
              boxShadow: currentStatus === '' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            All Works ({paintings.length})
          </button>
          <button
            onClick={() => setSearchParams({ status: 'available' })}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 600,
              backgroundColor: currentStatus === 'available' ? 'var(--color-bg-card)' : 'transparent',
              color: currentStatus === 'available' ? 'var(--color-olive)' : 'var(--color-text-muted)',
              boxShadow: currentStatus === 'available' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Available Now
          </button>
          <button
            onClick={() => setSearchParams({ status: 'sold' })}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 600,
              backgroundColor: currentStatus === 'sold' ? 'var(--color-bg-card)' : 'transparent',
              color: currentStatus === 'sold' ? 'var(--color-rose)' : 'var(--color-text-muted)',
              boxShadow: currentStatus === 'sold' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sold Archive
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          <input
            type="text"
            placeholder="Search by title, artist, or style..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', backgroundColor: 'var(--color-bg-card)' }}
          />
        </div>
      </div>

      {/* Catalogue Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: '2.5rem'
        }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card" style={{ padding: '1rem' }}>
              <div className="skeleton-box" style={{ aspectRatio: '4/3', marginBottom: '1rem' }} />
              <div className="skeleton-box" style={{ height: '22px', width: '75%', marginBottom: '0.6rem' }} />
              <div className="skeleton-box" style={{ height: '16px', width: '45%', marginBottom: '1rem' }} />
              <div className="skeleton-box" style={{ height: '36px', width: '100%' }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchPaintings} />
      ) : filteredPaintings.length === 0 ? (
        <EmptyState
          title="No paintings match your filter"
          description="Try selecting a different status filter tab or clearing your search term."
          actionText="Show All Paintings"
          onAction={() => {
            setSearchTerm('');
            setSearchParams({});
          }}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: '2.5rem'
        }}>
          {filteredPaintings.map((painting) => {
            const isSold = painting.status === 'sold';

            return (
              <div
                key={painting.id}
                className="artwork-card"
                style={{
                  opacity: isSold ? 0.88 : 1,
                  backgroundColor: 'var(--color-bg-card)'
                }}
              >
                {/* Artwork Image with Aspect Ratio and Subtle Zoom on Hover */}
                <div className="artwork-image-container">
                  <img
                    src={`/${painting.imageUrl}`}
                    alt={painting.title}
                    style={{
                      filter: isSold ? 'grayscale(25%) contrast(95%)' : 'none'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/favicon.svg';
                    }}
                  />
                  <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                    <span className="one-of-a-kind-badge">One of a kind</span>
                  </div>
                  <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                    <StatusBadge status={painting.status} />
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 600 }}>
                      Artist: {painting.artist}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontFamily: 'monospace' }}>
                      #{painting.id}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', margin: '0.2rem 0 0.65rem', lineHeight: 1.3 }}>
                    <Link to={`/paintings/${painting.id}`} style={{ color: 'inherit' }}>
                      {painting.title}
                    </Link>
                  </h3>

                  <p style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '0.88rem',
                    lineHeight: 1.55,
                    marginBottom: '1.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {painting.description}
                  </p>

                  <div style={{
                    marginTop: 'auto',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                        Studio Price
                      </span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                        ₹{painting.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link
                        to={`/paintings/${painting.id}`}
                        className="btn btn-secondary btn-sm"
                        title="View Full Painting Details"
                      >
                        <Eye size={15} /> Details
                      </Link>

                      {!isSold ? (
                        <button
                          onClick={() => handleBuy(painting)}
                          className="btn btn-primary btn-sm"
                          title="Purchase this one-of-a-kind original"
                        >
                          <ShoppingCart size={15} /> Buy
                        </button>
                      ) : (
                        <span style={{
                          fontSize: '0.82rem',
                          color: 'var(--color-rose)',
                          fontWeight: 700,
                          padding: '0.35rem 0.65rem',
                          backgroundColor: 'var(--color-rose-light)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-rose-border)'
                        }}>
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dedicated Painting Purchase Modal with Delivery Address Collection */}
      <PaintingPurchaseModal
        isOpen={!!purchasingPainting}
        painting={purchasingPainting}
        onClose={() => setPurchasingPainting(null)}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  );
};
