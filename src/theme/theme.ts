import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
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
    },
    text: {
      primary: '#182038',
      secondary: '#666666',
    },
    success: {
      main: '#22C55E',
      light: '#4ADE80',
      dark: '#16A34A',
    },
  },
  typography: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    h1: {
      fontFamily: 'Montserrat, system-ui, sans-serif',
      fontWeight: 'bold',
    },
    h2: {
      fontFamily: 'Montserrat, system-ui, sans-serif',
      fontWeight: 'bold',
    },
    h3: {
      fontFamily: 'Montserrat, system-ui, sans-serif',
      fontWeight: 'bold',
    },
    h4: {
      fontFamily: 'Montserrat, system-ui, sans-serif',
      fontWeight: 'bold',
    },
    h5: {
      fontFamily: 'Montserrat, system-ui, sans-serif',
      fontWeight: 'bold',
    },
    h6: {
      fontFamily: 'Montserrat, system-ui, sans-serif',
      fontWeight: 'bold',
    },
    subtitle1: {
      fontFamily: 'Open Sans, system-ui, sans-serif',
      fontWeight: 600,
    },
    subtitle2: {
      fontFamily: 'Open Sans, system-ui, sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: 'Open Sans, system-ui, sans-serif',
    },
    body2: {
      fontFamily: 'Open Sans, system-ui, sans-serif',
    },
    button: {
      fontFamily: 'Open Sans, system-ui, sans-serif',
      fontWeight: 600,
      textTransform: 'none',
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
  },
});
