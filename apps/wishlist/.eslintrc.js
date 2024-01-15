module.exports = {
  extends: ['@repo/eslint-config/next.js'],
  rules: {
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    'unicorn/filename-case': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'import/no-named-as-default': 'off',
    'no-nested-ternary': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
  },
};
