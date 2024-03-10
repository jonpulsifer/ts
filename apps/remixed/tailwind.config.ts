import sharedConfig from '@repo/tailwind-config';
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Pick<Config, 'content' | 'presets' | 'theme' | 'darkMode'> = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  presets: [sharedConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        creepster: ['var(--font-creepster)'],
      },
    },
  },
};

export default config;
