/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { navy: { 700: '#16295a', 800: '#0f1f45', 900: '#0a1530', 950: '#060d1f' } },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'], mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'] },
      keyframes: {
        rise: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } },
        pop: { from: { opacity: 0, transform: 'scale(.96)' }, to: { opacity: 1, transform: 'none' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        draw: { to: { strokeDashoffset: 0 } },
      },
      animation: { rise: 'rise .35s ease-out both', pop: 'pop .2s ease-out both', floaty: 'floaty 6s ease-in-out infinite', draw: 'draw 2s ease-out forwards' },
    },
  },
  plugins: [],
};
