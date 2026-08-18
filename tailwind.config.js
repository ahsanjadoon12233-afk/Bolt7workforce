/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0a14',
          900: '#0f0f1e',
          800: '#1a1a2e',
          700: '#232342',
          600: '#2d2d52',
        },
        gold: {
          50: '#fbf6e3',
          100: '#f5e9c0',
          200: '#ecd98a',
          300: '#e0c457',
          400: '#d4af37',
          500: '#b8932b',
          600: '#947322',
          700: '#6e541c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-mid': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 24s linear infinite',
        'spin-slower': 'spin 40s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'gradient-pan': 'gradientPan 12s ease infinite',
        'fade-up': 'fadeUp 0.7s ease forwards',
        'marquee': 'marquee 32s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-24px) translateX(8px)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.55', filter: 'blur(40px)' },
          '50%': { opacity: '0.9', filter: 'blur(56px)' },
        },
        gradientPan: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
