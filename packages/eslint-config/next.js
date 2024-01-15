const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

module.exports = {
  extends: [
    'next',
    'turbo',
    'eslint-config-turbo',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ].map(require.resolve),
  parserOptions: {
    project,
  },
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
      node: {
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  ignorePatterns: ['node_modules/', 'dist/'],
  // add rules configurations here
  rules: {
    'import/no-default-export': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
