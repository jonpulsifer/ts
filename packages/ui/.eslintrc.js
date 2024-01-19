module.exports = {
  extends: ['@repo/eslint-config/react.js'],
  rules: {
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    'eslint-comments/require-description': 'off',
    'no-nested-ternary': 'off',
  },
};
