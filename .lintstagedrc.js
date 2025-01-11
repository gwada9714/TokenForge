module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests',
  ],
  '*.sol': ['prettier --write', 'solhint'],
  '*.{json,md,yml}': ['prettier --write'],
};
