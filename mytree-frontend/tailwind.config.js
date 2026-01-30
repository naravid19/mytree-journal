/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite-react/**/*.js",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981', // emerald-500
          light: '#34D399', // emerald-400
          dark: '#059669', // emerald-600
        },
        secondary: {
          DEFAULT: '#14B8A6', // teal-500
          light: '#2DD4BF', // teal-400
          dark: '#0D9488', // teal-600
        },
        background: {
          DEFAULT: '#F9FAFB', // gray-50
          dark: '#111827', // gray-900
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1F2937', // gray-800
        },
        text: {
          DEFAULT: '#1F2937', // gray-800
          dark: '#F3F4F6', // gray-100
          muted: '#6B7280', // gray-500
        }
      },
      fontFamily: {
        sans: ['var(--font-kanit)', 'var(--font-geist-sans)', 'sans-serif'],
        heading: ['var(--font-kanit)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        kanit: ['var(--font-kanit)', 'sans-serif'], // Keep for backward compatibility if used directly
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-out': 'fade-out 0.2s ease-in forwards',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-out-right': 'slide-out-right 0.3s ease-in forwards',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'bounce-subtle': 'bounce-subtle 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [require('flowbite/plugin')],
};