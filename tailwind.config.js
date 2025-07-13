/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#216e39',
        secondary: '#39d353',
        danger: '#e53935',
      },
    },
  },
  plugins: [],
} 