import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
// We want each package to be responsible for its own content.
const config: Omit<Config, "content"> = {
  theme: {
    screens: {
      'xxs': '320px',
      'xs': '475px',
      ...defaultTheme.screens,
    },
    extend: {
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'spin-slower': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
