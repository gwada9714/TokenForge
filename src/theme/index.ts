import { DefaultTheme } from 'styled-components';
import { COLORS, SPACING, THEME_CONFIG } from '@/config/constants/theme';

const getSpacing = (value: number): string => {
  const base = 0.25; // 4px
  return `${base * value}rem`;
};

export const theme: DefaultTheme = {
  colors: {
    ...COLORS,
    forge: '#FF6B6B',  // Custom color for forge
    ember: '#4ECDC4',  // Custom color for ember
    severity: {
      success: COLORS.success,
      warning: COLORS.warning,
      error: COLORS.error,
      info: COLORS.info,
    },
    border: '#e5e7eb'
  },
  spacing: getSpacing,
  borderRadius: {
    small: '0.25rem',
    medium: '0.375rem',
    large: '0.5rem'
  },
  boxShadow: THEME_CONFIG.boxShadow,
  transition: THEME_CONFIG.transition,
};

export * from './styles/global';