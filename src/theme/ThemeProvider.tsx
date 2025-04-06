import React from "react";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import CssBaseline from "@mui/material/CssBaseline";
import { theme as styledTheme } from "./styledTheme";

const muiTheme = createTheme({
  palette: {
    primary: {
      main: styledTheme.colors.primary.main,
      light: styledTheme.colors.primary.light,
      dark: styledTheme.colors.primary.dark,
    },
    secondary: {
      main: styledTheme.colors.secondary.main,
      light: styledTheme.colors.secondary.light,
      dark: styledTheme.colors.secondary.dark,
    },
    background: {
      default: styledTheme.colors.background.default,
      paper: styledTheme.colors.background.paper,
    },
    text: {
      primary: styledTheme.colors.text.primary,
      secondary: styledTheme.colors.text.secondary,
    },
  },
  typography: {
    fontFamily: styledTheme.typography.fontFamily.body,
    h1: {
      fontFamily: styledTheme.typography.fontFamily.heading,
      fontWeight: styledTheme.typography.fontWeight.bold,
    },
    h2: {
      fontFamily: styledTheme.typography.fontFamily.heading,
      fontWeight: styledTheme.typography.fontWeight.bold,
    },
    h3: {
      fontFamily: styledTheme.typography.fontFamily.heading,
      fontWeight: styledTheme.typography.fontWeight.bold,
    },
    h4: {
      fontFamily: styledTheme.typography.fontFamily.heading,
      fontWeight: styledTheme.typography.fontWeight.bold,
    },
    h5: {
      fontFamily: styledTheme.typography.fontFamily.heading,
      fontWeight: styledTheme.typography.fontWeight.bold,
    },
    h6: {
      fontFamily: styledTheme.typography.fontFamily.heading,
      fontWeight: styledTheme.typography.fontWeight.bold,
    },
  },
  breakpoints: {
    values: {
      xs: styledTheme.breakpoints.values.xs,
      sm: styledTheme.breakpoints.values.sm,
      md: styledTheme.breakpoints.values.md,
      lg: styledTheme.breakpoints.values.lg,
      xl: styledTheme.breakpoints.values.xl,
    },
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MUIThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={styledTheme}>
        <CssBaseline />
        {children}
      </StyledThemeProvider>
    </MUIThemeProvider>
  );
}
