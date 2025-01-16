import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ChakraProvider } from '@chakra-ui/react';
import { theme as styledTheme } from './styledTheme';
import chakraTheme from './theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ChakraProvider theme={chakraTheme}>
      <StyledThemeProvider theme={styledTheme}>
        {children}
      </StyledThemeProvider>
    </ChakraProvider>
  );
};
