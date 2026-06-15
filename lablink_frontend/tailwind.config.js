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
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5bcfd',
          400: '#7a96fa',
          500: '#4f6ef7',
          600: '#2e4fc7',
          700: '#1e3a8a',
          800: '#1a3070',
          900: '#142558',
        },
        navy: {
          600: '#1a2f5e',
          700: '#162549',
          800: '#111e3c',
          900: '#0d1830',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}