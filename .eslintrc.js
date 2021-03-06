module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2017,
    sourceType: "module"
  },
  extends: ["eslint:recommended"],
  plugins: ['prettier'],
  rules: {
    "no-console": [0],
    "rest-spread-spacing": [2],
    "key-spacing": [2],
    "space-infix-ops": [2],
    "object-curly-spacing": ["error", "always"],
    "indent": [2, 4],
    "quotes": [0, "single"],
    "space-before-blocks": [0, "always"],
    "eqeqeq": 0,
    "no-eval": 0,
    "no-useless-escape": 0,
    "valid-jsdoc": 0,
    "valid-typeof": 2,
    "id-match": 0,
    "max-depth": [0, 4],
    "max-len": [0, 180, 4],
    "max-nested-callbacks": [0, 2],
    "complexity": [0, 11],
    "camelcase": 2,
    "constructor-super": 0,
    "no-duplicate-case": 2,
    "no-fallthrough": 2,
    "no-unreachable": 2,
    "react-hooks/rules-of-hooks": "error",
    "no-unused-vars": [
      0,
      {
        "vars": "all",
        "args": "none"
      }
    ]
  }
};
