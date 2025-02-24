import { DefaultTheme } from 'styled-components';

export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7'
  },
  text: {
    primary: '#000000',
    secondary: '#8E8E93'
  }
};

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem'
};

export const THEME = {
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease-in-out'
};

export const theme = {
  colors: COLORS,
  spacing: SPACING,
  ...THEME
};
