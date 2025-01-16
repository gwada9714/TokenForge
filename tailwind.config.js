/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
      animation: {
        'forge-glow': 'forge-glow 2s ease-in-out infinite',
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
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}