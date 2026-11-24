import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        github: {
          dark: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          green: {
            0: '#161b22',
            1: '#0e4429',
            2: '#006d32',
            3: '#26a641',
            4: '#39d353',
          },
        },
      },
      padding: {
        safe: 'env(safe-area-inset-bottom, 16px)',
        'safe-top': 'env(safe-area-inset-top, 0px)',
      },
      screens: {
        xs: '375px',
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(16, 185, 129, 0.25)',
        'glow-amber': '0 0 24px -4px rgba(245, 158, 11, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
