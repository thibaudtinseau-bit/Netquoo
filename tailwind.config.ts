import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Bleu Netquoo
        brand: {
          50: '#EEF4FF',
          100: '#DCE8FF',
          200: '#B9D1FF',
          300: '#8AB2FF',
          400: '#5A8CFF',
          500: '#3366FF',
          600: '#1F4FEA',
          700: '#183EC2',
          800: '#17349A',
          900: '#162E79',
          950: '#0B1A47',
        },
        ink: '#0A1633',
        sky: {
          50: '#F5F9FF',
          100: '#E9F2FF',
        },
        aqua: '#38BDF8',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(10,22,51,0.04), 0 8px 24px -8px rgba(10,22,51,0.10)',
        lift: '0 2px 4px rgba(10,22,51,0.04), 0 24px 48px -16px rgba(23,52,154,0.28)',
        glow: '0 10px 40px -10px rgba(51,102,255,0.55)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
} satisfies Config;
