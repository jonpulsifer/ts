import sharedConfig from '@repo/tailwind-config';
import type { Config } from 'tailwindcss';

const config: Pick<Config, 'prefix' | 'presets' | 'content' | 'corePlugins'> = {
  content: ['./src/**/*.tsx'],
  // prefix: "ui-",
  presets: [sharedConfig],
  corePlugins: {
    preflight: false,
  },
};

export default config;
