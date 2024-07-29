/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        '55vh': '55vh',
        '90': '90%',
      },
    },
  },
  plugins: [],
}

