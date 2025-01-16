import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    primary: {
      DEFAULT: '#182038',
      light: '#2a3654',
      dark: '#0c1019',
    },
    secondary: {
      DEFAULT: '#D97706',
      light: '#f59e0b',
      dark: '#b45309',
    },
    tertiary: {
      DEFAULT: '#F5F5F5',
      light: '#FFFFFF',
      dark: '#E5E5E5',
    },
    text: {
      light: '#FFFFFF',
      dark: '#1F2937',
      muted: '#6B7280',
    },
    gradient: {
      primary: 'linear-gradient(45deg, #182038 0%, #2a3654 100%)',
      secondary: 'linear-gradient(45deg, #D97706 0%, #f59e0b 100%)',
    },
    success: {
      main: '#22C55E',
      light: '#4ADE80',
      dark: '#16A34A',
    },
  },
  fonts: {
    heading: 'Montserrat, system-ui, sans-serif',
    body: 'Open Sans, system-ui, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
        transition: 'all 0.2s',
      },
      variants: {
        primary: {
          bg: 'primary.DEFAULT',
          color: 'text.light',
          _hover: {
            bg: 'primary.dark',
            transform: 'translateY(-1px)',
          },
        },
        secondary: {
          bg: 'secondary.DEFAULT',
          color: 'text.light',
          _hover: {
            bg: 'secondary.dark',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    Text: {
      baseStyle: {
        color: 'text.dark',
        fontFamily: 'body',
      },
    },
    Heading: {
      baseStyle: {
        color: 'text.dark',
        fontFamily: 'heading',
        fontWeight: 'bold',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'tertiary.DEFAULT',
        color: 'text.dark',
        fontFamily: 'body',
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;
