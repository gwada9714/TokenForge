import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ReactNode } from 'react';
import { THEME, BREAKPOINTS } from '@/config/constants';
import { GlobalStyle } from './styles/global';

// MUI theme configuration
const muiTheme = createTheme({
  palette: {
    primary: {
      main: THEME.PRIMARY,
    },
    secondary: {
      main: THEME.SECONDARY,
    },
    error: {
      main: THEME.ERROR,
    },
    warning: {
      main: THEME.WARNING,
    },
    info: {
      main: THEME.INFO,
    },
    success: {
      main: THEME.SUCCESS,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: parseInt(BREAKPOINTS.sm),
      md: parseInt(BREAKPOINTS.md),
      lg: parseInt(BREAKPOINTS.lg),
      xl: parseInt(BREAKPOINTS.xl),
    },
  },
});

// Styled-components theme
const styledTheme = {
  colors: THEME,
  breakpoints: BREAKPOINTS,
};

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <StyledThemeProvider theme={styledTheme}>
      <MuiThemeProvider theme={muiTheme}>
        <GlobalStyle />
        {children}
      </MuiThemeProvider>
    </StyledThemeProvider>
  );
};

export default ThemeProvider; 