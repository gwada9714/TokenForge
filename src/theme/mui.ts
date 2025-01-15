import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create base theme
const baseTheme = createTheme({
  palette: {
    primary: {
      main: '#006BFF',
      light: '#2E86FF',
      dark: '#0054CC',
    },
    secondary: {
      main: '#003D99',
      light: '#5CA0FF',
      dark: '#002766',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '1rem',
          paddingRight: '1rem',
          '@media (min-width: 600px)': {
            paddingLeft: '2rem',
            paddingRight: '2rem',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
  },
});

// Apply responsive font sizes and export
const muiTheme = responsiveFontSizes(baseTheme);

export default muiTheme;
