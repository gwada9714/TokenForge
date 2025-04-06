module.exports = {
  presets: [
    "@babel/preset-env",
    ["@babel/preset-react", { runtime: "classic" }],
    "@babel/preset-typescript",
  ],
  plugins: [
    ["@babel/plugin-transform-runtime", { regenerator: true }],
    "@babel/plugin-syntax-import-meta",
    ["@emotion/babel-plugin", { sourceMap: true }],
  ],
};
