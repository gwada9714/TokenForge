export const tokens = {
  colors: {
    primary: {
      main: '#182038', // Bleu foncé profond
      light: '#2A3352',
      dark: '#0F1525',
    },
    secondary: {
      main: '#D97706', // Orange métallisé
      light: '#F59E0B',
      dark: '#B45309',
    },
    background: {
      default: '#F5F5F5', // Gris clair
      paper: '#FFFFFF',
      dark: '#121212',
    },
    text: {
      primary: '#182038',
      secondary: '#4B5563',
      light: '#F5F5F5',
    },
    action: {
      active: '#D97706',
      hover: '#F59E0B',
      selected: '#B45309',
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#B91C1C',
    },
    success: {
      main: '#059669',
      light: '#10B981',
      dark: '#047857',
    },
    warning: {
      main: '#D97706',
      light: '#F59E0B',
      dark: '#B45309',
    },
  },
  typography: {
    fontFamily: {
      heading: 'Montserrat, sans-serif',
      body: 'Open Sans, sans-serif',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
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
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    default: '200ms ease-in-out',
    slow: '300ms ease-in-out',
    fast: '100ms ease-in-out',
  },
  zIndex: {
    modal: 1000,
    popup: 900,
    header: 800,
    dropdown: 700,
  },
} as const;

export type Tokens = typeof tokens;
