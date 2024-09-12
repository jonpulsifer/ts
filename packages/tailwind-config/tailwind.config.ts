import pluginHeadlessUi from '@headlessui/tailwindcss';
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

// We want each package to be responsible for its own content.
const config: Omit<Config, 'content'> = {
  theme: {
    screens: {
      xxs: '320px',
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'spin-slower': 'spin 3s linear infinite',
      },
      scale: {
        '200': '2',
        '250': '2.5',
        '300': '3',
        '350': '3.5',
        '400': '4',
        '450': '4.5',
        '500': '5',
      },
    },
  },
  plugins: [pluginHeadlessUi],
};
export default config;
