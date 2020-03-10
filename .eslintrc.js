/* eslint-env node */

module.exports = {
  globals: {
    server: true
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  extends: ['eslint:recommended', 'plugin:ember-best-practices/recommended' ],
  plugins: ['prettier'],
  env: {
    browser: true
  },
  rules: {
    'prettier/prettier': 'error',
    indent: [2, 2, { SwitchCase: 1 }],
    'comma-dangle': ['error', 'never'],
    quotes: [2, 'single', 'avoid-escape'],
    'no-use-before-define': [2, 'nofunc'],
    'prefer-rest-params': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'no-underscore-dangle': 0,
    'space-before-function-paren': ['error', 'never'],
    camelcase: 0,
    'no-restricted-syntax': [0, 'ForInStatements'],
    'import/no-extraneous-dependencies': 0,
    'no-console': 1
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
<<<<<<< HEAD
        sourceType: 'script',
        ecmaVersion: 2016
=======
        sourceType: 'script'
>>>>>>> 43f88b38... message
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here

        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off'
      })
    }
  ]
};
