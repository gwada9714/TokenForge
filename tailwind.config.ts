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
        'metal': '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
        'forge-card': '0 4px 6px -1px rgba(24, 32, 56, 0.1), 0 2px 4px -1px rgba(24, 32, 56, 0.06)'
      },
      backgroundImage: {
        'gradient-forge': tokens.colors.gradient.primary,
        'gradient-secondary': tokens.colors.gradient.secondary,
        'gradient-metal': 'linear-gradient(180deg, #F5F5F5, #E5E5E5)',
        'forge-pattern': 'url("/patterns/forge-pattern.svg")',
        'chain-pattern': 'url("/patterns/chain-pattern.svg")'
      },
      animation: {
        'forge-glow': 'forge-glow 2s ease-in-out infinite',
        'metal-shine': 'metal-shine 3s linear infinite',
        'forge-hammer': 'forge-hammer 1.5s ease-in-out infinite',
        'chain-move': 'chain-move 3s linear infinite'
      },
      keyframes: {
        'forge-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(217, 119, 6, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(217, 119, 6, 0.6)' }
        },
        'metal-shine': {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' }
        },
        'forge-hammer': {
          '0%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(-20deg)' },
          '100%': { transform: 'rotate(0deg)' }
        },
        'chain-move': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-10px)' }
        }
      },
      backdropFilter: {
        'forge': 'blur(8px) brightness(0.8)',
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
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config
