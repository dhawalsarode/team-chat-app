/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#050816',
        surface: '#0f172a',
        surfaceAlt: '#020617',
        accent: '#38bdf8',
        accentSoft: '#0ea5e9',
        borderSubtle: '#1f2937'
      }
    }
  },
  plugins: []
};
