import { createTheme } from '@mui/material/styles';
import { Components, Theme } from '@mui/material/styles';

const colors = {
  forge: {
    main: '#FF6B2B',
    dark: '#E65A1F',
    light: '#FF8C5A'
  },
  ember: {
    main: '#FF4B2B',
    dark: '#E63A1F',
    light: '#FF6C5A'
  },
  metal: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

const components: Components<Omit<Theme, "components">> = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
      }
    },
    variants: [
      {
        props: { variant: 'forge' },
        style: {
          backgroundColor: colors.forge.main,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: colors.forge.dark,
          },
          '&:active': {
            backgroundColor: colors.forge.light,
          },
        },
      },
      {
        props: { variant: 'ember' },
        style: {
          backgroundColor: colors.ember.main,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: colors.ember.dark,
          },
          '&:active': {
            backgroundColor: colors.ember.light,
          },
        },
      },
    ],
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        backgroundColor: 'white',
        borderWidth: '1px',
        borderColor: colors.metal[400],
      }
    },
    variants: {
      forge: {
        borderLeftWidth: '4px',
        borderLeftColor: colors.forge.main,
      },
      ember: {
        borderLeftWidth: '4px',
        borderLeftColor: colors.ember.main,
      },
    },
  },
  MuiInput: {
    styleOverrides: {
      root: {
        borderColor: colors.forge[200],
        '&:hover': {
          borderColor: colors.forge[300],
        },
        '&:focus': {
          borderColor: colors.forge.main,
          boxShadow: `0 0 0 1px ${colors.forge.main}`,
        },
      }
    }
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        borderColor: colors.forge[200],
        '&:hover': {
          borderColor: colors.forge[300],
        },
        '&:focus': {
          borderColor: colors.forge.main,
          boxShadow: `0 0 0 1px ${colors.forge.main}`,
        },
      }
    }
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
        }
      }
    }
  }
};

const fonts = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
};

const styles = {
  global: {
    body: {
      backgroundColor: colors.metal[50],
      color: colors.metal[800],
    },
  },
};

export const forgeTheme = createTheme({
  palette: {
    primary: {
      main: colors.forge.main,
      dark: colors.forge.dark,
      light: colors.forge.light,
    },
    secondary: {
      main: colors.ember.main,
      dark: colors.ember.dark,
      light: colors.ember.light,
    }
  },
  typography: fonts,
  components,
  styles,
});
