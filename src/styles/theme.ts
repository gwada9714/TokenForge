import { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  colors: {
    primary: {
      main: '#182038',
      light: '#2a3654',
      dark: '#0c1019',
    },
    secondary: {
      main: '#D97706',
      light: '#f59e0b',
      dark: '#b45309',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
      dark: '#E5E5E5',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      light: '#FFFFFF',
    },
    forge: {
      glow: 'rgba(217, 119, 6, 0.4)',
      metallic: 'linear-gradient(45deg, #182038 0%, #2a3654 50%, #182038 100%)',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#B45309',
    },
  },
  typography: {
    fontFamily: {
      heading: 'Montserrat, system-ui, sans-serif',
      body: 'Open Sans, system-ui, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    default: 'all 0.3s ease-in-out',
    fast: 'all 0.15s ease-in-out',
    slow: 'all 0.45s ease-in-out',
  },
};
