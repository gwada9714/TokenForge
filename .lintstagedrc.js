module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.sol': ['prettier --write', 'solhint'],
  '*.{json,md,yml}': ['prettier --write']
}
