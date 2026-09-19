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
          DEFAULT: '#0078ad',
          dark: '#00466b',
          light: '#e7f5fa',
        },
        secondary: {
          DEFAULT: '#5f7380',
        },
        navy: '#003d5d',
        accent: '#e52333',
      }
    },
  },
  plugins: [],
}
