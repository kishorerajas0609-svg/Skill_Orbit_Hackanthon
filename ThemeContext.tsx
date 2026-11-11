import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('skillorbit_theme');
    return (saved as Theme) || 'dark';
  });

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.remove('dark', 'light');
      root.classList.add(systemDark ? 'dark' : 'light');
    } else {
      root.classList.remove('dark', 'light');
      root.classList.add(t);
    }
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('skillorbit_theme', theme);
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      if (localStorage.getItem('skillorbit_access_token')) {
        await api.post('/auth/theme', { theme: newTheme });
      }
    } catch (e) {
      // ignore offline theme sync
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
