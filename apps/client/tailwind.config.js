/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        dark: {
          100: '#d5d5d5',
          200: '#aaaaaa',
          300: '#808080',
          400: '#555555',
          500: '#2b2b2b',
          600: '#222222',
          700: '#1a1a1a',
          800: '#111111',
          900: '#090909',
          950: '#000000',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 10s ease-in-out infinite',
        'float-slow-reverse': 'float-slow-reverse 8s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'float-slow-reverse': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(15px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
      dropShadow: {
        'glow': '0 0 8px rgba(14, 165, 233, 0.3)',
      },
    },
  },
  plugins: [],
}; 