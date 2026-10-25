import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { profileApi } from '../api/profileApi.js';

const ThemeContext = createContext(null);

const STORAGE_KEY_PREFIX = 'kalakriti_theme_preference';

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Determine storage key based on active session
  const getStorageKey = useCallback((userId) => {
    return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : `${STORAGE_KEY_PREFIX}_guest`;
  }, []);

  const [themeMode, setThemeModeState] = useState(() => {
    // Initial check from localStorage or default to system
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_guest`);
      return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
    } catch {
      return 'system';
    }
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Watch system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Synchronize when authenticated user changes
  useEffect(() => {
    if (user) {
      const userKey = getStorageKey(user.id || user._id);
      let preferred = user.themePreference;
      if (!preferred || !['light', 'dark', 'system'].includes(preferred)) {
        try {
          const cached = localStorage.getItem(userKey);
          preferred = cached && ['light', 'dark', 'system'].includes(cached)
            ? cached
            : (user.role === 'ADMIN' ? 'dark' : 'system');
        } catch {
          preferred = user.role === 'ADMIN' ? 'dark' : 'system';
        }
      } else if (user.role === 'ADMIN' && preferred === 'system') {
        // If an admin has default system set on account, check if cached or default to dark
        try {
          const cached = localStorage.getItem(userKey);
          if (cached && ['light', 'dark', 'system'].includes(cached)) {
            preferred = cached;
          } else {
            preferred = 'dark';
          }
        } catch {
          preferred = 'dark';
        }
      }
      setThemeModeState(preferred);
      try {
        localStorage.setItem(userKey, preferred);
      } catch (e) {
        // storage disabled/full
      }
    } else {
      // Guest mode
      try {
        const guestPref = localStorage.getItem(getStorageKey(null)) || 'system';
        setThemeModeState(guestPref);
      } catch {
        setThemeModeState('system');
      }
    }
  }, [user, getStorageKey]);

  // Determine active resolved theme ('light' or 'dark')
  const resolvedTheme = themeMode === 'system' ? (systemIsDark ? 'dark' : 'light') : themeMode;

  // Apply data-theme attribute on root element immediately
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback(async (mode) => {
    if (!['light', 'dark', 'system'].includes(mode)) return;
    setThemeModeState(mode);

    const storageKey = getStorageKey(user?.id || user?._id);
    try {
      localStorage.setItem(storageKey, mode);
    } catch (e) {
      // storage unavailable
    }

    // Persist to user profile if logged in
    if (user) {
      try {
        await profileApi.updateProfile({ themePreference: mode });
      } catch (err) {
        // Silently preserve local preference even if server request fails
        console.warn('Could not sync theme preference to server:', err?.message);
      }
    }
  }, [user, getStorageKey]);

  return (
    <ThemeContext.Provider value={{ themeMode, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
