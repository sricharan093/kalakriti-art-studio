import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="page-wrapper" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-terracotta-light)',
        color: 'var(--color-terracotta)',
        marginBottom: '1.5rem'
      }}>
        <Palette size={40} />
      </div>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>404</h1>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Canvas Not Found</h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto 2.5rem', fontSize: '1.05rem' }}>
        The artwork or page you are looking for has been moved, archived, or never existed in our studio gallery.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={18} /> Return Home
        </Link>
        <Link to="/catalogue" className="btn btn-secondary">
          <Palette size={18} /> Browse Catalogue
        </Link>
      </div>
    </div>
  );
};
