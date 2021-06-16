/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    babel: {
      plugins: [ require.resolve('ember-auto-import/babel-plugin') ]
    },
    // hinting: false,
    // 'ember-cli-babel': {
    //   includePolyfill: true
    // },

    'ember-composable-helpers': {
      only: ['toggle', 'next', 'pipe', 'contains']
    },

    'ember-cli-string-helpers': {
      only: ['titleize', 'humanize']
    },

    emberCliDropzonejs: {
      includeDropzoneCss: false
    },

    'ember-uikit': {
      useIcons: false
    },

    fingerprint: {
      exclude: ['images/otb-themes']
    }
  });

  app.import('node_modules/pell/dist/pell.min.css');

  return app.toTree();
};
