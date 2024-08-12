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
      },
      animation: {
        'highlight': 'highlight-animation 3s ease-in-out',
      },
      keyframes: {
        'highlight-animation': {
          '0%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 rgba(255, 255, 0, 0)',
          },
          '50%': {
            transform: 'scale(1.5)',
            boxShadow: '0 0 30px rgba(255, 255, 0, 1)',
          },
          '100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 rgba(255, 255, 0, 0)',
          },
        },
      },
    },
  },
  plugins: [],
}

