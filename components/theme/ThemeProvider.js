'use client';

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {THEME_STORAGE_KEY, applyThemeDom, resolveTheme} from '@/lib/theme';

const ThemeContext = createContext({
  preference: 'system',
  resolved: 'light',
  setPreference: () => {},
  cyclePreference: () => {},
  toggleLightDark: () => {},
});

function readStoredPreference() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* ignore */
  }
  return 'system';
}

function getSystemDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({children}) {
  const [preference, setPreferenceState] = useState('system');
  const [systemDark, setSystemDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pref = readStoredPreference();
    const dark = getSystemDark();
    setPreferenceState(pref);
    setSystemDark(dark);
    applyThemeDom(pref, dark);
    document.documentElement.classList.add('asas-theme-ready');
    setReady(true);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      setSystemDark(e.matches);
      const current = readStoredPreference();
      if (current === 'system') applyThemeDom('system', e.matches);
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const setPreference = useCallback((next) => {
    const pref = next === 'light' || next === 'dark' || next === 'system' ? next : 'system';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch {
      /* ignore */
    }
    setPreferenceState(pref);
    applyThemeDom(pref, getSystemDark());
  }, []);

  const cyclePreference = useCallback(() => {
    // dark → light → system → dark (from System, first click enters Dark)
    const order = ['dark', 'light', 'system'];
    const idx = order.indexOf(preference);
    setPreference(order[(idx + 1) % order.length]);
  }, [preference, setPreference]);

  const toggleLightDark = useCallback(() => {
    const next = resolveTheme(preference, getSystemDark()) === 'dark' ? 'light' : 'dark';
    setPreference(next);
  }, [preference, setPreference]);

  const resolved = useMemo(
    () => resolveTheme(preference, systemDark),
    [preference, systemDark],
  );

  const value = useMemo(
    () => ({preference, resolved, setPreference, cyclePreference, toggleLightDark, ready}),
    [preference, resolved, setPreference, cyclePreference, toggleLightDark, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
