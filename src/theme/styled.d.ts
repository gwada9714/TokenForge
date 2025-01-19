import 'styled-components';

type ColorSet = {
  main: string;
  light: string;
  dark: string;
  border?: string;
  hover?: string;
};

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type SpacingOptions = {
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
};

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: ColorSet;
      secondary: ColorSet;
      success: Omit<ColorSet, 'border' | 'hover'>;
      warning: Omit<ColorSet, 'border' | 'hover'>;
      ember: ColorSet;
      text: {
        primary: string;
        secondary: string;
        light: string;
      };
      background: {
        default: string;
        paper: string;
        dark: string;
      };
      gradient: {
        primary: string;
        secondary: string;
        forge: string;
      };
      forge: ColorSet & {
        metallic: string;
        glow: string;
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
      fontSizes: SpacingOptions & {
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
      };
    };
    spacing: SpacingOptions;
    breakpoints: {
      values: Record<BreakpointKey, number>;
      up: (key: BreakpointKey) => string;
      down: (key: BreakpointKey) => string;
      between: (start: BreakpointKey, end: BreakpointKey) => string;
    };
  }
}
