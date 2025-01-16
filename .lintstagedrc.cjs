module.exports = {
  '*.{js,jsx,ts,tsx,cjs}': files => [
    `eslint --fix ${files.join(' ')}`,
    `prettier --write ${files.join(' ')}`
  ],
  '*.sol': files => [
    `prettier --write ${files.join(' ')}`,
    `solhint ${files.join(' ')}`
  ],
  '*.{json,md,yml}': files => [
    `prettier --write ${files.join(' ')}`
  ]
};
