import sharedConfig from 'tailwind-config';
import type { Config } from 'tailwindcss';

const config = {
  content: ['./src/**/*.tsx'],
  // prefix: 'ui-',
  plugins: [require('@headlessui/tailwindcss'), require('@tailwindcss/forms')],
  presets: [sharedConfig],
} satisfies Config;

export default config;
