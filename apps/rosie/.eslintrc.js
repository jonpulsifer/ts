module.exports = {
  extends: ['@repo/eslint-config/nest.js'],
  rules: {
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
  },
};
