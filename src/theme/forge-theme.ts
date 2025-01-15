import { extendTheme } from '@chakra-ui/react';

const colors = {
  forge: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800', // Primary
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  ember: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336', // Secondary
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
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

const components = {
  Button: {
    variants: {
      forge: {
        bg: 'forge.500',
        color: 'white',
        _hover: {
          bg: 'forge.600',
          _disabled: {
            bg: 'forge.300',
          },
        },
        _active: {
          bg: 'forge.700',
        },
      },
      ember: {
        bg: 'ember.500',
        color: 'white',
        _hover: {
          bg: 'ember.600',
          _disabled: {
            bg: 'ember.300',
          },
        },
        _active: {
          bg: 'ember.700',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      p: '6',
      bg: 'white',
      boxShadow: 'lg',
      rounded: 'lg',
      borderWidth: '1px',
      borderColor: 'gray.100',
    },
    variants: {
      forge: {
        borderLeftWidth: '4px',
        borderLeftColor: 'forge.500',
      },
      ember: {
        borderLeftWidth: '4px',
        borderLeftColor: 'ember.500',
      },
    },
  },
  // Styles personnalisés pour les composants de formulaire
  Input: {
    variants: {
      forge: {
        field: {
          borderColor: 'forge.200',
          _hover: {
            borderColor: 'forge.300',
          },
          _focus: {
            borderColor: 'forge.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-forge-500)',
          },
        },
      },
    },
  },
  Select: {
    variants: {
      forge: {
        field: {
          borderColor: 'forge.200',
          _hover: {
            borderColor: 'forge.300',
          },
          _focus: {
            borderColor: 'forge.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-forge-500)',
          },
        },
      },
    },
  },
};

const fonts = {
  heading: '"Roboto Slab", serif',
  body: '"Open Sans", sans-serif',
};

const styles = {
  global: {
    body: {
      bg: 'gray.50',
      color: 'metal.800',
    },
  },
};

export const forgeTheme = extendTheme({
  colors,
  components,
  fonts,
  styles,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});
