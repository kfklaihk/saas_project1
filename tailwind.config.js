/** @type {import('tailwindcss').Config} */
export default {
  content: [
     './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}', // If using App Router
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

