/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          purple: {
            light: '#F3E8FF',
            DEFAULT: '#D8B4FE',
            dark: '#A855F7',
          },
          mint: {
            light: '#D1FAE5',
            DEFAULT: '#6EE7B7',
            dark: '#10B981',
          },
        },
      },
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
