import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'cyberpunk' | 'matrix' | 'synthwave';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('mylife_theme');
    return (saved === 'matrix' || saved === 'synthwave') ? saved : 'cyberpunk';
  });

  useEffect(() => {
    // Set theme attribute on document root
    const root = document.documentElement;
    if (theme === 'cyberpunk') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('mylife_theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setThemeState((current) => {
      if (current === 'cyberpunk') return 'matrix';
      if (current === 'matrix') return 'synthwave';
      return 'cyberpunk';
    });
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
