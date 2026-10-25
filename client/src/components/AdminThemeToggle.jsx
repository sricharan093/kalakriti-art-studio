import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { Moon, Sun, Monitor } from 'lucide-react';

export const AdminThemeToggle = ({ compact = false, showLabels = true }) => {
  const { themeMode, resolvedTheme, setTheme } = useTheme();

  const options = [
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'system', label: 'System', icon: Monitor }
  ];

  return (
    <div
      role="group"
      aria-label="Theme preference selector"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        gap: '2px'
      }}
    >
      {options.map(({ mode, label, icon: Icon }) => {
        const isActive = themeMode === mode;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            aria-pressed={isActive}
            title={`Switch to ${label} theme (${mode === 'system' ? `currently ${resolvedTheme}` : mode})`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: compact ? '0.35rem 0.55rem' : '0.4rem 0.75rem',
              borderRadius: '6px',
              border: isActive ? '1px solid var(--color-terracotta)' : '1px solid transparent',
              backgroundColor: isActive ? 'var(--color-terracotta-light)' : 'transparent',
              color: isActive ? 'var(--color-terracotta)' : 'var(--color-text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              lineHeight: 1
            }}
          >
            <Icon size={14} />
            {showLabels && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
};
