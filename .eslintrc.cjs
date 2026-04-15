module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': 'off'
  },
  overrides: [
    {
      files: ['__tests__/**/*.js'],
      env: {
        jest: true
      }
    },
    {
      files: ['playwright.config.cjs'],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ]
};
