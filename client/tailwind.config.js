/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        gh: {
          bg: '#0d1117',
          card: '#161b22',
          cardHover: '#1f242c',
          subtle: '#21262d',
          border: '#30363d',
          borderMuted: '#21262d',
          text: '#f0f6fc',
          muted: '#8b949e',
          link: '#58a6ff',
          green: '#238636',
          greenHover: '#2ea043',
          greenText: '#3fb950',
          purple: '#8957e5',
          purpleText: '#a371f7',
          yellow: '#d29922',
          red: '#f85149',
        },
      },
      boxShadow: {
        'gh': '0 0 0 1px #30363d, 0 3px 6px rgba(1, 4, 9, 0.4)',
      },
    },
  },
  plugins: [],
};
