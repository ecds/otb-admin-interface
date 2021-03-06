/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    hinting: false,
    'ember-cli-babel': {
      includePolyfill: true
    },

    'ember-composable-helpers': {
      only: ['toggle', 'next', 'pipe', 'contains']
    },

    'ember-cli-string-helpers': {
      only: ['titleize']
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

  app.import('node_modules/jodit/build/jodit.min.js');

  return app.toTree();
};
