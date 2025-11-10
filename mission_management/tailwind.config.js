/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        jjk: {
          black: '#0d0f12',
          dark: '#14171c',
          ash: '#1e2229',
          indigo: '#4338ca',
          purple: '#6d28d9',
          crimson: '#b91c1c',
          gold: '#fbbf24',
          fog: '#94a3b8',
        },
      },
      boxShadow: {
        mystical: '0 0 0 1px rgba(109,40,217,0.4), 0 4px 24px -2px rgba(67,56,202,0.45)',
      },
      backgroundImage: {
        'jjk-radial': 'radial-gradient(circle at 30% 30%, rgba(109,40,217,0.25), transparent 70%)',
        'jjk-gradient': 'linear-gradient(135deg, #0d0f12 0%, #14171c 45%, #1e2229 100%)',
      },
      borderRadius: {
        xl: '1rem',
      },
      transitionTimingFunction: {
        'swift-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
