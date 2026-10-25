import React from 'react';
import { Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = Palette,
  title = 'No records found',
  description = 'There are no items currently available in this section.',
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      backgroundColor: 'var(--color-bg-subtle)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--color-border-dark)',
      maxWidth: '560px',
      margin: '2rem auto'
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-terracotta-light)',
        color: 'var(--color-terracotta)',
        marginBottom: '1.25rem'
      }}>
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        {description}
      </p>
      {actionLink && actionText && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      )}
      {onAction && actionText && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};
