import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  { id: 'dark-emerald', name: 'Dark Emerald', icon: '🌙', bg: 'bg-slate-950', accent: '#10B981', type: 'dark' },
  { id: 'light-stadium', name: 'Light Stadium (Claro)', icon: '☀️', bg: 'bg-slate-100', accent: '#059669', type: 'light' },
  { id: 'midnight-cyber', name: 'Midnight Cyber', icon: '🌌', bg: 'bg-slate-950', accent: '#3B82F6', type: 'dark' },
  { id: 'gold-champions', name: 'Gold Champions', icon: '👑', bg: 'bg-neutral-950', accent: '#F59E0B', type: 'dark' },
  { id: 'red-passion', name: 'Red Passion', icon: '🔴', bg: 'bg-slate-950', accent: '#EF4444', type: 'dark' }
];

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('career_tracker_theme') || 'dark-emerald';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('career_tracker_theme', currentTheme);

    // Apply light vs dark class
    if (currentTheme === 'light-stadium') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [currentTheme]);

  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
