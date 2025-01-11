module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:testing-library/react',
    'plugin:jest/recommended',
  ],
  plugins: ['testing-library', 'jest'],
  rules: {
    'testing-library/no-render-in-setup': 'off',
    'testing-library/no-node-access': 'off',
    'jest/no-conditional-expect': 'off',
    'jest/valid-expect': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-restricted-globals': ['error', 'name', 'length'],
    'import/first': 'error',
    'no-new-func': 'warn',
  },
};
