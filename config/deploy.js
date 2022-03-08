/* eslint-env node */
'use strict';

module.exports = function(deployTarget) {
  let ENV = {
    build: {}
    // include other plugin configuration that applies to all deploy targets here
  };

  if (deployTarget === 'development') {
    ENV.build.environment = 'development';
    // configure other plugins for development deploy target here
  }

  if (deployTarget === 'staging') {
    ENV.build.environment = 'staging';
    ENV['simply-ssh'] = {
      connection: {
        // parameter hash accepted by SSH2, see https://github.com/mscdex/ssh2 for details
        host: '3.238.239.164',
        port: 22,
        username: 'deploy',
        privateKey: process.env.SSH_KEY
      },
      dir: '/data/otb-admin-interface',
      keep: 5
    };
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    ENV['simply-ssh'] = {
      connection: {
        // parameter hash accepted by SSH2, see https://github.com/mscdex/ssh2 for details
        host: '34.239.167.5',
        port: 22,
        username: 'deploy',
        privateKey: process.env.SSH_KEY
      },
      dir: '/data/otb-admin-interface',
      keep: 5
    };
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
