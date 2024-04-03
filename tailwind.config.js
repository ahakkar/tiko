/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        /** slate-100 */
        tarsky100: {
          light: '#f1f5f9',
          DEFAULT: '#f1f5f9',
          dark: '#64748b',
        },
        /** slate-200 */
        tarsky200: {
          light: '#e2e8f0',
          DEFAULT: '#e2e8f0',
          dark: '#334155',
        },
        /** slate-300 */
        tarsky300: {
          light: '#cbd5e1',
          DEFAULT: '#cbd5e1',
          dark: '#0f172a',
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
