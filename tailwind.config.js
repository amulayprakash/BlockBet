/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'casino-black': '#0B0B0B',
        'casino-red': '#C4001A',
        'casino-red-dark': '#8B0012',
        'casino-red-light': '#FF0020',
        'casino-gold': '#D4AF37',
      },
      boxShadow: {
        'neon-red': '0 0 20px #C4001A, 0 0 40px #C4001A, 0 0 60px #C4001A',
        'neon-red-sm': '0 0 10px #C4001A, 0 0 20px #C4001A',
        'neon-red-lg': '0 0 30px #C4001A, 0 0 60px #C4001A, 0 0 90px #C4001A',
      },
      backgroundImage: {
        'gradient-casino': 'linear-gradient(to bottom, #0B0B0B, #1a1a1a, #0B0B0B)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
      },
    },
  },
  plugins: [],
}
