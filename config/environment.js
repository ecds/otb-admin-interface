/* eslint-env node */

module.exports = environment => {
  const ENV = {
    modulePrefix: 'open-tour-builder',
    environment,
    rootURL: '/admin',
    locationType: 'auto',
    historySupportMiddleware: true,
    'ember-cli-mirage': {
      enabled: false
    },

    'ember-simple-auth': {
      routeAfterAuthentication: 'admin.index',
      routeIfAlreadyAuthenticated: 'admin.index'
    },

    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    googleFonts: ['Open+Sans:300,400,700', 'Source+Sans+Pro:300'],

    torii: {
      sessionServiceName: 'session',
      providers: {
        ecds: {}
      }
    },

    fauxOAuth: {
      baseUrl: 'http://auth.digitalscholarship.emory.edu/auth/'
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    ENV.APP.API_HOST = 'https://otb.org:3000';
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV['g-map'] = {
      key: 'AIzaSyD-G_lDtvChv-P3nchtQYHoCLfFzn9ylr8',
      libraries: ['places'],
      language: 'en'
    };
    ENV['fauxOAuth'].tokenValidationUrl = 'https://otb.org:3000/auth/verify/';
    ENV['fauxOAuth'].tokenAuthUrl = 'https://otb.org:3000/auth/tokens/';
    ENV['fauxOAuth'].redirectUrl = 'https://lvh.me:4200/admin/torii/redirect.html';

  }

  if (environment === 'mobile') {
    ENV.locationType = 'hash';
    ENV.rootURL = '';
    ENV.sub = 'jay';
    ENV.APP.API_HOST = 'otb.org:3000';
    ENV['g-map'] = {
      key: 'AIzaSyD-G_lDtvChv-P3nchtQYHoCLfFzn9ylr8',
      protocol: 'https'
    };
  }

  if (environment === 'test') {
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
    ENV.APP.API_HOST = 'otb.org:3000';
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'staging') {
    ENV.APP.API_HOST = 'https://api.opentour.emory.edu';

    ENV['g-map'] = {
      key: 'AIzaSyC0l_y6pP0DK4oig0ile1XLbRx9HUQeryE',
      protocol: 'https'
    };

    ENV.torii.providers['facebook-oauth2'] = {
      apiKey: '383939088765607',
      redirectUri: 'https://obt.ecdsdev.org/admin/torii/redirect.html'
    };

    ENV.torii.providers['google-oauth2-bearer-v2'] = {
      apiKey:
        '171053764894-edtmjrjbnh8jukcbsgdue4sovqpe1l5f.apps.googleusercontent.com',
      redirectUri: 'https://otb.ecdsdev.org/admin/torii/redirect.html',
      scope: 'email'
    };
  }

  if (environment === 'production') {
    ENV.APP.API_HOST = 'https://api.opentour.emory.edu';
    ENV['g-map'] = {
      key: 'AIzaSyC0l_y6pP0DK4oig0ile1XLbRx9HUQeryE',
      protocol: 'https'
    };

    ENV.torii.providers['google-oauth2-bearer-v2'] = {
      apiKey:
        '583999668970-8t0a0k6lrop28kdgar02sq41gkhet9fa.apps.googleusercontent.com',
      redirectUri: 'https://opentour.emory.edu/admin/torii/redirect.html',
      scope: 'email'
    };

    ENV.torii.providers['facebook-oauth2'] = {
      apiKey: '373879153234380',
      redirectUri: 'https://opentour.emory.edu/admin/torii/redirect.html'
    };
  }

  if (environment === 'gsuWalkingTours') {
    ENV.APP.API_HOST = 'https://otb.org:3000';
    ENV.APP.TENANT = 'campus-tour';
    ENV['g-map'] = {
      key: 'AIzaSyD-G_lDtvChv-P3nchtQYHoCLfFzn9ylr8',
      protocol: 'https'
    };
  }

  ENV.contentSecurityPolicy = {
    'default-src': "'none'",
    'script-src': "'self' 'unsafe-eval' *.googleapis.com maps.gstatic.com",
    'font-src': "'self' fonts.gstatic.com",
    'connect-src': "'self' maps.gstatic.com",
    'img-src': "'self' *.googleapis.com maps.gstatic.com csi.gstatic.com",
    'style-src': "'self' 'unsafe-inline' fonts.googleapis.com maps.gstatic.com"
  };

  return ENV;
};
