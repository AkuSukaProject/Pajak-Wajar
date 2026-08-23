import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F7FB',
        ink: '#172033',
        stamp: '#9B3038',
        verified: '#176B5B',
        pending: '#8A6518',
        margin: '#667085',
        line: '#D9E1EC',
        blue: '#2457C5'
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
        body: ['Arial', 'Helvetica', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        sheet: '0 18px 50px rgba(23, 32, 51, 0.10)'
      }
    }
  },
  plugins: []
};

export default config;
