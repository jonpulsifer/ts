module.exports = {
  extends: ["next", "turbo", "plugin:prettier/recommended", 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
  },
  "env": {
    "browser": true,
    "node": true,
    "jest": true
  },
  "plugins": [
    "react",
    "@typescript-eslint"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  }
};
