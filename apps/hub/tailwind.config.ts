import sharedConfig from '@repo/tailwind-config';
import type { Config } from 'tailwindcss';

const config: Pick<Config, 'content' | 'presets' | 'theme'> = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [sharedConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        creepster: ['var(--font-creepster)'],
      },
    },
  },
};

export default config;
