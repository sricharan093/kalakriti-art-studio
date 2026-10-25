import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paintingApi } from '../api/paintingApi.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import {
  Palette,
  Brush,
  Coffee,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  Award
} from 'lucide-react';

export const HomePage = () => {
  const [featuredPaintings, setFeaturedPaintings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paintingApi.getPaintings('available')
      .then((data) => {
        if (data.paintings) {
          setFeaturedPaintings(data.paintings.slice(0, 3));
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* 1. LUXURY EDITORIAL GALLERY HERO (Ink Charcoal & Gallery Ivory with Authentic Artwork Imagery) */}
      <section className="dark-gallery-section" style={{ padding: '5.5rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center'
          }}>
            {/* Left Editorial Narrative */}
            <div>
              <div className="editorial-tag editorial-tag-terracotta" style={{ marginBottom: '1.75rem' }}>
                <Sparkles size={14} /> Heritage Fine Art & Studio Ceramics
              </div>

              <h1 style={{
                fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)',
                lineHeight: 1.1,
                marginBottom: '1.5rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: '#FCF9F4'
              }}>
                Art That Tells Our Stories.
              </h1>

              <p style={{
                fontSize: '1.15rem',
                color: '#D5CCC0',
                lineHeight: 1.75,
                marginBottom: '2.5rem',
                maxWidth: '540px'
              }}>
                Celebrate classical Indian folk art, handcrafted terracotta ceramics, and bespoke wall murals. Each painting is registered once in our atomic gallery—guaranteeing genuine one-of-a-kind ownership.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link
                  to="/catalogue"
                  className="btn btn-primary"
                  style={{
                    padding: '0.9rem 2rem',
                    fontSize: '1.02rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <Palette size={18} /> Explore the Collection
                </Link>
                <Link
                  to="/customer/wall-booking"
                  className="btn"
                  style={{
                    padding: '0.9rem 1.85rem',
                    fontSize: '1.02rem',
                    color: '#FCF9F4',
                    border: '1px solid rgba(252, 249, 244, 0.3)',
                    backgroundColor: 'rgba(252, 249, 244, 0.05)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <Brush size={18} /> Book a Wall Mural
                </Link>
              </div>

              {/* Editorial authenticity notes */}
              <div style={{
                display: 'flex',
                gap: '2rem',
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(252, 249, 244, 0.12)',
                fontSize: '0.85rem',
                color: '#B8ADA0',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="var(--color-terracotta)" />
                  <span>Single-Sale Guarantee</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="var(--color-terracotta)" />
                  <span>Master Folk Artisans</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="var(--color-terracotta)" />
                  <span>Natural Mineral Pigments</span>
                </div>
              </div>
            </div>

            {/* Right Editorial Composition with Real Seed Artworks */}
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.9fr',
                gap: '1.25rem',
                alignItems: 'center'
              }}>
                {/* Main Large Artwork Frame */}
                <div style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid rgba(252, 249, 244, 0.15)',
                  backgroundColor: '#36302A'
                }}>
                  <div style={{ position: 'relative', height: '360px' }}>
                    <img
                      src="/images/p-001.jpg"
                      alt="Madhubani Peacock Garden"
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
                      padding: '1.25rem',
                      background: 'linear-gradient(to top, rgba(41,36,31,0.95), transparent)',
                      color: '#FCF9F4'
                    }}>
                      <span className="one-of-a-kind-badge" style={{ marginBottom: '0.35rem' }}>One of a kind</span>
                      <div style={{ fontSize: '1.05rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>Madhubani Peacock Garden</div>
                      <div style={{ fontSize: '0.8rem', color: '#D5CCC0' }}>By Meera Kumari • Natural pigments on handmade paper</div>
                    </div>
                  </div>
                </div>

                {/* Second Supporting Artwork */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid rgba(252, 249, 244, 0.12)',
                    backgroundColor: '#36302A',
                    height: '210px'
                  }}>
                    <img
                      src="/images/p-003.jpg"
                      alt="Tanjore Lakshmi with Gold Leaf"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/favicon.svg';
                      }}
                    />
                  </div>

                  <div style={{
                    padding: '1.25rem',
                    backgroundColor: 'rgba(252, 249, 244, 0.06)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(252, 249, 244, 0.1)'
                  }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-terracotta)', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Studio Transparency
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#E8E0D5', lineHeight: 1.5 }}>
                      Transparent mural rates at <strong>₹150/sq.ft</strong> with zero hidden material costs.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE REFINED SERVICE CARDS */}
      <section className="page-wrapper" style={{ padding: '5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-terracotta)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>
            Curated Disciplines
          </span>
          <h2 style={{ fontSize: '2.4rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
            Artisan Craftsmanship & Studio Services
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
            Every discipline is practiced with museum-grade care, traditional mineral pigments, and verified artisan signatures.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '2rem'
        }}>
          {/* Service 1: Paintings */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem', border: '1px solid var(--color-border)' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-terracotta-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-terracotta)',
              marginBottom: '1.25rem'
            }}>
              <Palette size={26} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>Original Folk Paintings</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Hand-painted Madhubani, Warli, Tanjore, Pattachitra, and Kalamkari works on handmade paper and tussar silk. Guaranteed atomic single-collector acquisition.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <Link to="/catalogue" style={{ color: 'var(--color-terracotta)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Explore painting collection <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Service 2: Wall Murals */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem', border: '1px solid var(--color-border)' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-ochre-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-ochre)',
              marginBottom: '1.25rem'
            }}>
              <Brush size={26} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <h3 style={{ fontSize: '1.4rem' }}>Wall Painting Murals</h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--color-ochre-light)', color: 'var(--color-ochre)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                ₹150/sq.ft
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Bring heritage murals directly onto your living room, office, or dining walls. Strictly one booking accepted per calendar day for focused artisan attention.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <Link to="/customer/wall-booking" style={{ color: 'var(--color-terracotta)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Reserve mural date <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Service 3: Custom Pottery */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem', border: '1px solid var(--color-border)' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-olive-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-olive)',
              marginBottom: '1.25rem'
            }}>
              <Coffee size={26} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>Custom Wheel Pottery</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Wheel-turned kulhads, surahis, matkas, diya sets, and planters. Glazed in heritage mineral colors: Kumkum Red, Sandalwood Beige, Haldi Yellow, and Mehendi Green.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <Link to="/customer/pottery-request" style={{ color: 'var(--color-terracotta)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Commission pottery piece <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED ARTWORK SHOWCASE (Backed by real API) */}
      <section style={{
        backgroundColor: 'var(--color-bg-card)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '5rem 1.5rem'
      }}>
        <div className="page-wrapper" style={{ padding: 0 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-terracotta)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>
                Available Artworks
              </span>
              <h2 style={{ fontSize: '2.4rem', marginTop: '0.4rem' }}>Featured Gallery Pieces</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Each artwork is strictly one-of-a-kind. Once acquired, it enters our archived catalog.
              </p>
            </div>
            <Link to="/catalogue" className="btn btn-secondary">
              View Complete Catalogue <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="card" style={{ padding: '1rem' }}>
                  <div className="skeleton-box" style={{ height: '260px', marginBottom: '1rem' }} />
                  <div className="skeleton-box" style={{ height: '24px', width: '70%', marginBottom: '0.5rem' }} />
                  <div className="skeleton-box" style={{ height: '16px', width: '50%', marginBottom: '1rem' }} />
                  <div className="skeleton-box" style={{ height: '36px', width: '40%' }} />
                </div>
              ))}
            </div>
          ) : featuredPaintings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              No featured paintings currently available. Check back soon!
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
              gap: '2.25rem'
            }}>
              {featuredPaintings.map((p) => (
                <div key={p.id} className="artwork-card">
                  {/* Image with zoom on hover */}
                  <div className="artwork-image-container">
                    <img
                      src={`/${p.imageUrl}`}
                      alt={p.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/favicon.svg';
                      }}
                    />
                    <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                      <span className="one-of-a-kind-badge">One of a kind</span>
                    </div>
                    <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>

                  {/* Artwork Metadata */}
                  <div style={{ padding: '1.6rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 600, letterSpacing: '0.04em' }}>
                      Artist: {p.artist}
                    </span>
                    <h3 style={{ fontSize: '1.3rem', margin: '0.4rem 0 0.65rem', lineHeight: 1.3 }}>
                      {p.title}
                    </h3>
                    <p style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '0.88rem',
                      lineHeight: 1.55,
                      marginBottom: '1.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {p.description}
                    </p>

                    <div style={{
                      marginTop: 'auto',
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                          Price
                        </span>
                        <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <Link to={`/paintings/${p.id}`} className="btn btn-primary btn-sm">
                        View Artwork
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. STUDIO NARRATIVE — INDIAN ARTISAN HERITAGE */}
      <section style={{ backgroundColor: 'var(--color-sand)', padding: '5.5rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-terracotta)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>
                Heritage & Process
              </span>
              <h2 style={{ fontSize: '2.3rem', margin: '0.5rem 0 1.25rem', lineHeight: 1.2 }}>
                Centuries of Tradition, Preserved with Contemporary Grace
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                KalaKriti Art Studio bridges indigenous Indian art lineages with modern patrons. We partner directly with master practitioners of Madhubani, Warli, Tanjore, Pattachitra, and Kalamkari.
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.75 }}>
                Our studio ceramics are turned by generational potters using hand-kneaded river clay and fired in wood-fired kilns with non-toxic, all-natural mineral glazes.
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <h4 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', fontWeight: 700 }}>Our Studio Standard</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-olive-light)', color: 'var(--color-olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={14} />
                  </div>
                  <span><strong>100% Authentic Pigments:</strong> Madder root, indigo leaf, turmeric, and lampblack ground in gum arabica.</span>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-olive-light)', color: 'var(--color-olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={14} />
                  </div>
                  <span><strong>Atomic Catalog Registration:</strong> Every canvas is unique; when purchased, it is immediately reserved without duplicate sales.</span>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-olive-light)', color: 'var(--color-olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={14} />
                  </div>
                  <span><strong>Fair Artisan Compensation:</strong> Master creators receive direct honorariums and transparent rates.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section style={{
        padding: '5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg-subtle)'
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>
            Transform Your Environment With Authentic Art
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Whether commissioning a home wall mural, collecting an original canvas, or ordering custom glazed ceramics, our studio team is here to assist you.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/catalogue" className="btn btn-primary" style={{ padding: '0.85rem 1.85rem' }}>
              <Palette size={18} /> Browse Paintings
            </Link>
            <Link to="/customer/pottery-request" className="btn btn-secondary" style={{ padding: '0.85rem 1.85rem' }}>
              <Coffee size={18} /> Custom Pottery Request
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
