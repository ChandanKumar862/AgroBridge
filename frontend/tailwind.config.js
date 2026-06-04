/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',      // Slate 900
          earth: '#064e3b',     // Green 900 (Deep Forest)
          emerald: '#059669',   // Green 600 (Leaf Green)
          mint: '#10b981',      // Green 500 (Vibrant Grass)
          sage: '#a7f3d0',      // Green 200 (Soft Sage)
          amber: '#d97706',     // Amber 600 (Harvest Orange)
          gold: '#f59e0b',      // Amber 500 (Ripe Gold)
          cream: '#fcfbf7',     // Pure Warm Beige
          clay: '#f4ede1',      // Soil Clay Beige
          sand: '#efe8d9',      // Soft Sandy Beige
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        accent: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(6, 78, 59, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(6, 78, 59, 0.15)',
        'premium': '0 20px 50px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
