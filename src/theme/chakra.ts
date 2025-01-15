import { 
  extendTheme,
  type ThemeConfig,
  withDefaultColorScheme,
} from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = {
  config,
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
}

export const chakraTheme = extendTheme(
  theme,
  withDefaultColorScheme({ colorScheme: 'brand' })
) 