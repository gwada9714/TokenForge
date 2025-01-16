import React from 'react';
import { tokens } from './tokens';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeContext = React.createContext(tokens);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={tokens}>
      <div className="min-h-screen bg-background text-text-primary font-body">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
