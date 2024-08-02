/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        '90': '90%',
      },
      width: {
        '85': '85%',
      },
      inset: {
        '10p': '10%',
      }
    },
  },
  plugins: [],
}

