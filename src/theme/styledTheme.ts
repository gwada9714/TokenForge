export const theme = {
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
  },
  typography: {
    fontFamily: {
      heading: 'Montserrat, system-ui, sans-serif',
      body: 'Open Sans, system-ui, sans-serif',
    },
    fontWeights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },
  transitions: {
    default: 'all 0.2s ease-in-out',
    slow: 'all 0.3s ease-in-out',
    fast: 'all 0.1s ease-in-out',
  },
  zIndex: {
    navbar: 1000,
    modal: 1300,
    tooltip: 1500,
  },
};
