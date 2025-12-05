module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 14,
    sourceType: 'module'
  },
  rules: {
    'no-underscore-dangle': 'off',
    'no-console': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }]
  }
};
