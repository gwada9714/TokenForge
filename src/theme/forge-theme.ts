import { createTheme, Theme } from '@mui/material/styles';
import { Components } from '@mui/material/styles';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    forge: true;
    ember: true;
  }
}

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    forge: true;
    ember: true;
  }
}

const colors = {
  forge: {
    main: '#FF6B2B',
    dark: '#E65A1F',
    light: '#FF8C5A',
    border: '#FFE0B2',
    hover: '#FF7A40'
  },
  ember: {
    main: '#FF4B2B',
    dark: '#E63A1F',
    light: '#FF6C5A',
    border: '#FFCDD2',
    hover: '#FF5A40'
  }
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
            backgroundColor: colors.forge.hover,
          },
          '&:active': {
            backgroundColor: colors.forge.dark,
          },
        },
      },
      {
        props: { variant: 'ember' },
        style: {
          backgroundColor: colors.ember.main,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: colors.ember.hover,
          },
          '&:active': {
            backgroundColor: colors.ember.dark,
          },
        },
      },
    ],
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
      }
    },
    variants: [
      {
        props: { variant: 'forge' },
        style: {
          borderLeft: `4px solid ${colors.forge.main}`,
        },
      },
      {
        props: { variant: 'ember' },
        style: {
          borderLeft: `4px solid ${colors.ember.main}`,
        },
      },
    ],
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          '& fieldset': {
            borderColor: colors.forge.border,
          },
          '&:hover fieldset': {
            borderColor: colors.forge.hover,
          },
          '&.Mui-focused fieldset': {
            borderColor: colors.forge.main,
          },
        }
      }
    }
  }
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
  components
});
