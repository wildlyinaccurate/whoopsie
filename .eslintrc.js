module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    jasmine: true
  },
  plugins: ["prettier"],
  extends: ["eslint:recommended", "plugin:prettier/recommended"]
};
