/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        tarsky: {
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        /** blue-300 */
        tarskyBlue300: {
          light: '#bfdbfe',
          DEFAULT: '#bfdbfe',
          dark: '#2563eb',
        },
        tarskyBlue500: {
          light: '#3b82f6',
          DEFAULT: '#3b82f6',
          dark: '#1e3a8a',
        },
        tarskyRed300: {
          light: '#fca5a5',
          DEFAULT: '#fca5a5',
          dark: '#b91c1c',
        },
        tarskyRed500: {
          light: '#ef4444',
          DEFAULT: '#ef4444',
          dark: '#7f1d1d',
        },
        white: {
          light: '#ffffff',
          DEFAULT: '#ffffff',
          dark: '#d6d6d6',
        },
      },
    },
  },
};
