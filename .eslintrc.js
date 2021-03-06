module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'eslint-plugin-turbopatent'
  ],
  extends: [
    'plugin:turbopatent/node'
  ],
  rules: {
    'no-console': 'off'
  },
  globals: {
    'Promise': true
  },
  overrides: [
    {
      files: [ 'bin/*' ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ]
};
