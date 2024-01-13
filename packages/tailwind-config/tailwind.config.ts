import type { Config } from 'tailwindcss';

// We want each package to be responsible for its own content.
const config: Omit<Config, 'content' | 'plugins' | 'presets'> = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
export default config;
