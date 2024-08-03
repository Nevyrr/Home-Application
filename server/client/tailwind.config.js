/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        '10': '10%',
        '90': '90%',
        '750px': '750px',
      },
      maxHeight: {
        '10': '10%',
        '90': '90%',
      },
      inset: {
        '10p': '10%',
      }
    },
  },
  plugins: [],
}

