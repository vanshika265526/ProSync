/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: '#020617',
        'neon-cyan': '#00F2EA',
        'electric-purple': '#7D00FF',
      },
      boxShadow: {
        'neon': '0 0 10px #00F2EA, 0 0 20px #00F2EA',
        'purple-glow': '0 0 10px #7D00FF, 0 0 20px #7D00FF',
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        shine: 'shine 3s linear infinite',
      },
    },
  },
  plugins: [],
};
