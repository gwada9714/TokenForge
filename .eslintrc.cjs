module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime' // Add this line to support the new JSX transform
  ],
  plugins: [
    '@typescript-eslint',
    'react'
  ],
  rules: {
    'no-console': 'off', // Changed from 'warn' to 'off' to allow console statements in development
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/jsx-uses-vars': 'error',
    'react/jsx-uses-react': 'error' // Added back to fix 'React is defined but never used' errors
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
