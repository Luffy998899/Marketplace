import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#080711',
          900: '#0d0b1a',
          800: '#141126',
          700: '#1d1935',
          600: '#2a2450',
        },
        neon: {
          500: '#8b5cf6',
          400: '#a78bfa',
          300: '#c4b5fd',
        },
        accent: '#22d3ee',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
