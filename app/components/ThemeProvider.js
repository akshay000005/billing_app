'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'futuristic', setTheme: () => {} });

export const THEMES = [
  { id: 'futuristic', name: 'Futuristic', desc: 'Dark cyberpunk with neon accents', colors: ['#00f5ff', '#a855f7', '#080b14'] },
  { id: 'professional', name: 'Professional', desc: 'Clean & corporate light theme', colors: ['#1e40af', '#7c3aed', '#f4f6f9'] },
  { id: 'ocean', name: 'Ocean Dark', desc: 'Deep navy with teal highlights', colors: ['#14b8a6', '#6366f1', '#0a1628'] },
  { id: 'emerald', name: 'Emerald', desc: 'Forest dark with mint accents', colors: ['#34d399', '#a78bfa', '#051a0f'] },
  { id: 'contrast', name: 'High Contrast', desc: 'Maximum readability', colors: ['#ffff00', '#ff88ff', '#000000'] },
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('futuristic');

  useEffect(() => {
    const saved = localStorage.getItem('accounpro_theme') || 'futuristic';
    setThemeState(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem('accounpro_theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
