 'use strict';

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  plugins: [
    'ember',
    'prettier'
  ],
  extends: [
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    'ember/no-jquery': 'error',
    'no-console': ["error", { allow: ["warn", "error"] }],
    'semi': "error"
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'server/**/*.js'
      ],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node']
    }
  ]
};
