/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#082F49',
        blue: '#0A78C2',
        bright: '#38BDF8',
        amber: '#F59E0B',
        canvas: '#F4F7FB',
        ink: '#102A43',
        muted: '#52677A',
        line: '#D8E2EC',
        success: '#23865B',
      },
      boxShadow: {
        card: '0 12px 32px rgba(8, 47, 73, 0.08)',
        lift: '0 18px 48px rgba(8, 47, 73, 0.12)',
        focus: '0 0 0 4px rgba(56, 189, 248, 0.20)',
      },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem' },
    },
  },
  plugins: [],
}
