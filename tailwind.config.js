/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0F14',
          soft: '#0F151C',
        },
        surface: '#131A22',
        surface2: '#1A232D',
        border: '#232D38',
        text: {
          primary: '#E8EDF2',
          muted: '#7C8B99',
          faint: '#4C5A68',
        },
        up: '#3DDC84',
        down: '#FF5C5C',
        gold: {
          DEFAULT: '#D4A24E',
          bright: '#E8BE72',
          dim: '#8C6B34',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        ticker: 'ticker 40s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
