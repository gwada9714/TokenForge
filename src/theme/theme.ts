import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF8C00',
      light: '#FFA333',
      dark: '#E67E00',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8E44AD',
      light: '#A569BD',
      dark: '#703688',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
    error: {
      main: '#E74C3C',
      light: '#FF6B6B',
      dark: '#C0392B',
    },
    warning: {
      main: '#F39C12',
      light: '#FDB846',
      dark: '#D68910',
    },
    success: {
      main: '#27AE60',
      light: '#2ECC71',
      dark: '#219A52',
    },
    info: {
      main: '#3498DB',
      light: '#5DADE2',
      dark: '#2980B9',
    },
  },
  typography: {
    fontFamily: "'Montserrat', 'Roboto', 'Arial', sans-serif",
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Montserrat';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('Montserrat'), local('Montserrat-Regular');
        }
        @font-face {
          font-family: 'Open Sans';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('Open Sans'), local('OpenSans-Regular');
        }
      `
    }
  }
});
