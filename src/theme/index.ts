import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    blue: {
      50: '#E5F0FF',
      100: '#B8D5FF',
      200: '#8ABBFF',
      300: '#5CA0FF',
      400: '#2E86FF',
      500: '#006BFF',
      600: '#0054CC',
      700: '#003D99',
      800: '#002766',
      900: '#001233',
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;