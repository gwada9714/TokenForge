import type { Config } from 'tailwindcss'
import { tokens } from './src/theme/tokens'

const config: Config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        secondary: tokens.colors.secondary,
        background: tokens.colors.background,
        text: tokens.colors.text,
        error: tokens.colors.error,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
      },
      fontFamily: {
        heading: tokens.typography.fontFamily.heading.split(',').map(font => font.trim()),
        body: tokens.typography.fontFamily.body.split(',').map(font => font.trim()),
      },
      fontSize: tokens.typography.fontSize,
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: {
        ...tokens.shadows,
        'forge': '0 0 15px rgba(217, 119, 6, 0.3)',
        'forge-hover': '0 0 20px rgba(217, 119, 6, 0.5)',
        'metal': '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
      },
      backgroundImage: {
        'gradient-forge': tokens.colors.gradient.primary,
        'gradient-secondary': tokens.colors.gradient.secondary,
        'gradient-metal': 'linear-gradient(180deg, #F5F5F5, #E5E5E5)'
      },
      animation: {
        'forge-glow': 'forge-glow 2s ease-in-out infinite',
        'metal-shine': 'metal-shine 3s linear infinite'
      },
      keyframes: {
        'forge-glow': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05)'
          }
        },
        'metal-shine': {
          '0%': {
            backgroundPosition: '200% 0'
          },
          '100%': {
            backgroundPosition: '-200% 0'
          }
        }
      },
      zIndex: {
        modal: '1000',
        popup: '900',
        header: '800',
        dropdown: '700',
      },
    }
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.metal-effect': {
          'background': 'linear-gradient(180deg, #F5F5F5, #E5E5E5)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'box-shadow': tokens.shadows.md,
          'position': 'relative',
          'overflow': 'hidden'
        },
        '.forge-highlight': {
          'position': 'relative',
          '&::after': {
            'content': '""',
            'position': 'absolute',
            'inset': '0',
            'background': 'linear-gradient(45deg, transparent, rgba(217, 119, 6, 0.1))',
            'pointer-events': 'none'
          }
        },
        '.transition-forge': {
          'transition': tokens.transitions.default
        }
      })
    }
  ]
}

export default config
