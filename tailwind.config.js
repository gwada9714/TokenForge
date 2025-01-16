/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#182038',
          light: '#2A3454',
          dark: '#0F142A'
        },
        secondary: {
          DEFAULT: '#D97706',
          light: '#F59E0B',
          dark: '#B45309'
        },
        accent: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#CCB100'
        },
        success: 'rgb(21 128 61)',
        error: 'rgb(220 38 38)',
        warning: 'rgb(234 179 8)',
        background: {
          DEFAULT: '#F5F5F5',
          dark: '#1A1A1A',
          paper: '#FFFFFF'
        }
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif']
      },
      boxShadow: {
        'forge': '0 0 15px rgba(217, 119, 6, 0.3)',
        'forge-hover': '0 0 20px rgba(217, 119, 6, 0.5)',
        'metal': '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
      },
      backgroundImage: {
        'gradient-forge': 'linear-gradient(45deg, #182038, #2A3454)',
        'gradient-metal': 'linear-gradient(180deg, #F5F5F5, #E5E5E5)'
      },
      animation: {
        'forge-glow': 'forge-glow 2s ease-in-out infinite',
        'metal-shine': 'metal-shine 3s linear infinite'
      },
      keyframes: {
        'forge-glow': {
          '0%, 100%': {
            opacity: 1,
            transform: 'scale(1)'
          },
          '50%': {
            opacity: 0.8,
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
      }
    }
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.metal-effect': {
          'background': 'linear-gradient(180deg, #F5F5F5, #E5E5E5)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'box-shadow': '0 2px 4px rgba(0,0,0,0.1)',
          'position': 'relative',
          'overflow': 'hidden'
        },
        '.forge-highlight': {
          'position': 'relative',
          '&::after': {
            'content': '""',
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'right': '0',
            'bottom': '0',
            'background': 'linear-gradient(45deg, transparent, rgba(217, 119, 6, 0.1))',
            'pointer-events': 'none'
          }
        },
        '.transition-forge': {
          'transition': 'all 0.3s ease-in-out'
        }
      }
      addUtilities(newUtilities)
    }
  ]
}