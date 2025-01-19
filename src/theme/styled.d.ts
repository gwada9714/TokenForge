import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: {
        main: string;
        light: string;
        dark: string;
        border: string;
        hover: string;
      };
      secondary: {
        main: string;
        light: string;
        dark: string;
        border: string;
        hover: string;
      };
      background: {
        default: string;
        paper: string;
        dark: string;
      };
      text: {
        primary: string;
        secondary: string;
        disabled: string;
        light: string;
      };
      forge: {
        main: string;
        dark: string;
        light: string;
        metallic: string;
        glow: string;
        border: string;
        hover: string;
      };
      success: {
        main: string;
        light: string;
        dark: string;
      };
      warning: {
        main: string;
        light: string;
        dark: string;
      };
      ember: {
        main: string;
        light: string;
        dark: string;
      };
      gradient: {
        primary: string;
        secondary: string;
        forge: string;
      };
    };
    typography: {
      fontFamily: {
        heading: string;
        body: string;
      };
      fontWeight: {
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
      };
      fontSizes: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
      };
    };
    spacing: {
      xs: string;
      sm: string;
      base: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
    };
    zIndex: {
      appBar: number;
      drawer: number;
      modal: number;
      snackbar: number;
      tooltip: number;
    };
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      up: (key: string) => string;
      down: (key: string) => string;
      between: (start: string, end: string) => string;
    };
    transitions: {
      default: string;
      fast: string;
      slow: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
  }
}
