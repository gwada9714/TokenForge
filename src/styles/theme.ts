import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: {
        main: string;
        light: string;
        dark: string;
      };
      secondary: {
        main: string;
        light: string;
        dark: string;
      };
      background: {
        default: string;
        paper: string;
        dark: string;
      };
      text: {
        primary: string;
        secondary: string;
        light: string;
      };
      gradient: {
        primary: string;
        secondary: string;
      };
      action: {
        active: string;
        hover: string;
        selected: string;
      };
      error: {
        main: string;
        light: string;
        dark: string;
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
    };
    typography: {
      fontFamily: {
        heading: string;
        body: string;
      };
      fontSize: {
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
      fontWeight: {
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
      };
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
    transitions: {
      default: string;
      slow: string;
      fast: string;
    };
    zIndex: {
      modal: number;
      popup: number;
      header: number;
      dropdown: number;
    };
    breakpoints: {
      values: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
      };
    };
  }
}

const theme = {
  colors: {
    primary: {
      main: '#182038',
      light: '#2A3352',
      dark: '#0F1525',
    },
    secondary: {
      main: '#D97706',
      light: '#F59E0B',
      dark: '#B45309',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
      dark: '#121212',
    },
    text: {
      primary: '#182038',
      secondary: '#4B5563',
      light: '#F5F5F5',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #182038 0%, #2A3352 100%)',
      secondary: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    },
    action: {
      active: '#D97706',
      hover: '#F59E0B',
      selected: '#B45309',
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#B91C1C',
    },
    success: {
      main: '#059669',
      light: '#10B981',
      dark: '#047857',
    },
    warning: {
      main: '#D97706',
      light: '#F59E0B',
      dark: '#B45309',
    },
  },
  typography: {
    fontFamily: {
      heading: "'Montserrat', sans-serif",
      body: "'Open Sans', sans-serif",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    default: '200ms ease-in-out',
    slow: '300ms ease-in-out',
    fast: '100ms ease-in-out',
  },
  zIndex: {
    modal: 1000,
    popup: 900,
    header: 800,
    dropdown: 700,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
} as const;

export { theme };
