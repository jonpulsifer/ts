/** @type {import("prettier").Config} */
const config = {
  printWidth: 80,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  tabWidth: 2,
  useTabs: false,
  overrides: [
    {
      files: '*.html',
      options: {
        trailingComma: 'none',
      },
    },
  ],
};

export default config;
