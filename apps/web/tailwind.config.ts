import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#0f1113',
          deep: '#131517',
        },
        surface: {
          DEFAULT: '#1c1e20',
          raised: '#22252a',
          muted: '#2e3031',
        },
        ink: {
          DEFAULT: '#f7f7f8',
          secondary: '#898a8b',
          dim: '#565a5e',
        },
        lime: {
          DEFAULT: '#d1fe17',
          dim: '#222b00',
          mid: '#4a5c00',
          glow: 'rgba(209, 254, 23, 0.35)',
        },
        border: {
          DEFAULT: '#2a2d31',
          subtle: '#1e2024',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        pill: '9999px',
      },
      boxShadow: {
        lime: '0 0 24px rgba(209, 254, 23, 0.25), 0 0 48px rgba(209, 254, 23, 0.08)',
        'lime-sm': '0 0 12px rgba(209, 254, 23, 0.2)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.3)',
      },
      letterSpacing: {
        display: '-0.03em',
        label: '0.12em',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse_lime: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'pulse-lime': 'pulse_lime 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
