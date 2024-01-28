module.exports = {
  root: true,
  extends: ['@repo/eslint-config/library'],
  rules: {
    'import/no-default-export': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
