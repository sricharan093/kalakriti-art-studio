import React, { useState, useEffect } from 'react';
import { getPotteryPhotoDetails } from '../data/potteryImages.js';
import { Sparkles, Camera, AlertCircle, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

export const PotteryPhotoViewer = ({
  itemId = 'i-01',
  glazeId = 'g-01',
  itemName,
  glazeName,
  quantity = 1,
  neededByDate = ''
}) => {
  const photoDetails = getPotteryPhotoDetails(itemId, glazeId);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset load state when form or glaze changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [itemId, glazeId]);

  const displayName = itemName || photoDetails.formName;
  const displayGlaze = glazeName || photoDetails.glazeName;
  const hasPhoto = photoDetails.isAvailable && !imageError;

  return (
    <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg-card)' }}>
      {/* Header with Title and Artisan Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-terracotta)', fontWeight: 700, fontSize: '0.95rem' }}>
          <Sparkles size={18} />
          <span>Live Studio Commission Preview</span>
        </div>
        <span
          className={hasPhoto ? 'badge badge-available' : 'badge badge-requested'}
          title={hasPhoto ? 'Studio photograph verified' : 'Firing in current studio kiln cycle'}
        >
          {hasPhoto ? 'Studio Photo' : 'Batch In Kiln'}
        </span>
      </div>

      {/* Main Photographic Display with 1:1 Aspect Ratio */}
      <div
        className="pottery-photo-preview-wrapper"
        style={{
          marginBottom: '1.5rem',
          position: 'relative',
          backgroundColor: 'var(--color-bg-subtle)'
        }}
      >
        {hasPhoto ? (
          <>
            {/* Loading placeholder skeleton */}
            {!imageLoaded && (
              <div
                className="skeleton-box"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 1
                }}
              />
            )}

            <img
              key={`${itemId}-${glazeId}`}
              src={photoDetails.imageUrl}
              alt={photoDetails.altText}
              loading="eager"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              className="pottery-photo-img"
              style={{
                opacity: imageLoaded ? 1 : 0,
                transform: imageLoaded ? 'scale(1)' : 'scale(0.98)',
                transition: 'opacity 0.3s ease, transform 0.3s ease'
              }}
            />

            {/* Subtle floating watermark tag indicating genuine handcrafted pottery */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                padding: '0.3rem 0.65rem',
                backgroundColor: 'rgba(23, 20, 17, 0.75)',
                backdropFilter: 'blur(6px)',
                borderRadius: 'var(--radius-sm)',
                color: '#FAF6F0',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                zIndex: 2
              }}
            >
              <Camera size={13} />
              <span>Studio Photograph &bull; {displayName}</span>
            </div>
          </>
        ) : (
          /* Error fallback if file fails to load */
          <div className="pottery-photo-fallback">
            <AlertCircle size={32} color="var(--color-rose)" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', marginBottom: '0.3rem', color: 'var(--color-text-main)' }}>
              Photograph Temporarily Unavailable
            </h4>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
              maxWidth: '320px'
            }}>
              {displayName} in {displayGlaze} can still be custom-commissioned through the studio form below.
            </p>
          </div>
        )}
      </div>

      {/* Active Glaze & Finish Information Card */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem 1.25rem',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: photoDetails.glazeHex,
            border: '2px solid var(--color-border-dark)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
            flexShrink: 0
          }}
          title={displayGlaze}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block',
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-light)',
            fontWeight: 700
          }}>
            Selected Glaze &bull; {photoDetails.finish}
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            {displayGlaze}
          </span>
          {photoDetails.mineralSource && (
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
              Source: {photoDetails.mineralSource}
            </span>
          )}
        </div>
      </div>

      {/* Live Commission Summary Specs */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        padding: '0.5rem 0',
        fontSize: '0.92rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Selected Form:</span>
          <strong style={{ color: 'var(--color-text-main)' }}>{displayName}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Batch Quantity:</span>
          <strong style={{ color: 'var(--color-text-main)' }}>
            {quantity} {quantity === 1 ? 'piece' : 'pieces'}
          </strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Needed-by Date:</span>
          <strong style={{ color: neededByDate ? 'var(--color-text-main)' : 'var(--color-rose)' }}>
            {neededByDate || 'Please select a date'}
          </strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.2rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Artisan Studio:</span>
          <strong style={{ color: 'var(--color-olive)' }}>Master Wheel Throwing &bull; KalaKriti</strong>
        </div>
      </div>
    </div>
  );
};
