import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F6F8', ink: '#14202E', blue: '#17497D', stamp: '#A32E28',
        pending: '#7A5C15', margin: '#5E6B7A', line: '#CBD3DC', white: '#FFFFFF'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace']
      },
      boxShadow: {
        sheet: '0 20px 55px rgba(20, 32, 46, 0.09)',
        lift: '0 8px 24px rgba(20, 32, 46, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
