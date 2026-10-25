import React from 'react';
import { Palette, Heart, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--color-bg-dark)',
      color: '#FCF9F4',
      borderTop: '1px solid var(--color-border)',
      marginTop: 'auto',
      padding: '4rem 1.5rem 2.5rem'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '3rem',
        marginBottom: '3rem'
      }}>
        {/* Brand identity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Palette size={20} />
            </div>
            <div>
              <span className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FCF9F4' }}>
                KalaKriti
              </span>
              <span style={{ display: 'block', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-terracotta)', fontWeight: 600 }}>
                Art Studio & Workshop
              </span>
            </div>
          </div>
          <p style={{ color: '#D5CCC0', fontSize: '0.88rem', lineHeight: 1.7 }}>
            Preserving classical Indian art forms — Madhubani, Warli, Tanjore, Pattachitra, Kalamkari, and custom ceramic pottery crafted by local heritage artisans.
          </p>
        </div>

        {/* Gallery Links */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FCF9F4' }}>
            Art Gallery & Services
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#D5CCC0' }}>
            <li>
              <Link to="/catalogue" style={{ transition: 'color 0.2s ease', color: '#D5CCC0' }}>
                Exclusive Paintings
              </Link>
            </li>
            <li>
              <Link to="/catalogue?status=available" style={{ transition: 'color 0.2s ease', color: '#D5CCC0' }}>
                Available Artworks
              </Link>
            </li>
            <li>
              <Link to="/customer/wall-booking" style={{ transition: 'color 0.2s ease', color: '#D5CCC0' }}>
                Handmade Wall Murals (₹150/sq.ft)
              </Link>
            </li>
            <li>
              <Link to="/customer/pottery-request" style={{ transition: 'color 0.2s ease', color: '#D5CCC0' }}>
                Custom Glazed Pottery
              </Link>
            </li>
          </ul>
        </div>

        {/* Studio hours */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FCF9F4' }}>
            Studio Hours & Visit
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#D5CCC0', lineHeight: 1.7 }}>
            Tuesday – Sunday: 10:00 AM – 7:30 PM<br />
            Mondays: Closed for master artisan workshops<br />
            42 Heritage Crafts Lane, Crafts Colony, Jaipur, Rajasthan
          </p>
        </div>

        {/* Authenticity Promise */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FCF9F4' }}>
            Authenticity Guarantee
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#D5CCC0', lineHeight: 1.7 }}>
            Every canvas is signed by master craftsmen using natural organic dyes, gold foils, and traditional hand-ground mineral pigments.
          </p>
        </div>
      </div>

      {/* Bottom copyright and assignment notice */}
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(252, 249, 244, 0.1)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.82rem',
        color: '#A89E92',
        gap: '1rem'
      }}>
        <p>© {new Date().getFullYear()} KalaKriti Art Studio. Second-Year GDGC MERN Stack Assignment.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          Crafted with <Heart size={14} color="var(--color-terracotta)" fill="var(--color-terracotta)" /> for classical heritage.
        </p>
      </div>
    </footer>
  );
};
