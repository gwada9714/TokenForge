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
          DEFAULT: 'rgb(37 99 235)',
          dark: 'rgb(29 78 216)'
        },
        success: 'rgb(21 128 61)',
        error: 'rgb(220 38 38)',
        warning: 'rgb(234 179 8)'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}