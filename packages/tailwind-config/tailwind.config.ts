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
  },
  plugins: [],
};
export default config;
