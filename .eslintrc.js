module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'no-unused-vars': 'warn',
    'react/prop-types': 'off',
    'no-undef': 'error',
    'react/react-in-jsx-scope': 'off',
    'no-restricted-globals': ['error', 'event', 'fdescribe'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}; 