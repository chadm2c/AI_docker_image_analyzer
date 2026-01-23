/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          dark: "#020617",
          gold: "#fbbf24",
          accent: "#38bdf8",
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
