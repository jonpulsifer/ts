const sharedConfig = require("tailwind-config/tailwind.config.js");

module.exports = {
  theme: {
    extend: {},
  },
  plugins: [require('@headlessui/tailwindcss')],
  presets: [sharedConfig],
};
