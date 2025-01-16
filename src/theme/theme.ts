import { createTheme } from '@mui/material/styles';

const theme = createTheme({
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
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 'semibold',
          borderRadius: '8px',
          transition: 'all 0.2s',
        },
      },
      variants: {
        primary: {
          styleOverrides: {
            root: {
              backgroundColor: '#182038',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#0c1019',
                transform: 'translateY(-1px)',
              },
            },
          },
        },
        secondary: {
          styleOverrides: {
            root: {
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#b45309',
                transform: 'translateY(-1px)',
              },
            },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#1F2937',
        },
      },
    },
  },
});

export default theme;
