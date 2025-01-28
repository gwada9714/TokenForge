import 'styled-components';

interface ColorSet {
  main: string;
  light: string;
  dark: string;
  border?: string;
  hover?: string;
}

interface ExtendedColorSet extends ColorSet {
  metallic?: string;
  glow?: string;
}

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: ColorSet;
      secondary: ColorSet;
      success: ColorSet;
      warning: ColorSet;
      error: ColorSet;
      info: ColorSet;
      grey: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
      text: {
        primary: string;
        secondary: string;
        disabled: string;
      };
      background: {
        default: string;
        paper: string;
      };
      ember: ExtendedColorSet;
      forge: ExtendedColorSet;
      gradient: {
        primary: string;
        secondary: string;
      };
    };
    typography: {
      fontFamily: {
        heading: string;
        body: string;
      };
      fontWeight: {
        light: number;
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
      };
      fontSizes: {
        xs: string;
        small: string;
        medium: string;
        large: string;
        xl: string;
        "2xl": string;
        "3xl": string;
        "4xl": string;
      };
    };
    borderRadius: {
      none: string;
      small: string;
      medium: string;
      large: string;
      xl: string;
      "2xl": string;
      full: string;
    };
    transitions: {
      default: string;
      fast: string;
      slow: string;
    };
    spacing: {
      (value: number): string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      base: string;
    };
    breakpoints: {
      values: Record<BreakpointKey, number>;
      up: (key: BreakpointKey) => string;
      down: (key: BreakpointKey) => string;
      between: (start: BreakpointKey, end: BreakpointKey) => string;
    };
  }
}
