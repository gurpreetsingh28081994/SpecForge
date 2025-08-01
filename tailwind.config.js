/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e20074',
          dark: '#b8005c',
          light: '#ff4fa3',
        },
      },
    },
  },
  plugins: [],
};
