import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        'surface-light': '#f7f8fc',
        'surface-dark': '#111827',
        accent: {
          DEFAULT: '#f97316',
          muted: '#ec4899'
        }
      },
      boxShadow: {
        card: '0 20px 45px rgba(15, 23, 42, 0.12)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.08)'
      },
      borderRadius: {
        xl: '1.25rem'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spinSlow 12s linear infinite'
      }
    }
  },
  plugins: []
}
