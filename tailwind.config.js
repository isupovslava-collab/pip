/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B2D4D',
        blue: '#0A78C2',
        amber: '#F4A62A',
        canvas: '#F6F8FB',
        ink: '#17202A',
        muted: '#607080',
        line: '#DDE4EC',
      },
      boxShadow: {
        card: '0 8px 24px rgba(11, 45, 77, 0.08)',
      },
    },
  },
  plugins: [],
}
