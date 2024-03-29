/* eslint-env node */

module.exports = environment => {
  const ENV = {
    modulePrefix: 'open-tour-builder',
    environment,
    rootURL: '/admin',
    locationType: 'auto',
    historySupportMiddleware: true,
    defaultCenterLat: 33.75432,
    defaultCenterLng: -84.38979,
    defaultSouth: 33.746101262568295,
    defaultNorth: 33.7594628740807,
    defaultEast: -84.38041814677302,
    defaultWest: -84.39878106994395,
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

    torii: {
      sessionServiceName: 'session',
      providers: {
        ecds: {}
      }
    },

    fauxOAuth: {
      baseUrl: 'https://auth.digitalscholarship.emory.edu/auth/'
    },

    emoryTenants: [
      ''
    ],

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  ENV['ember-google-maps'] = {
    key: 'AIzaSyD-G_lDtvChv-P3nchtQYHoCLfFzn9ylr8',
    libraries: ['places', 'drawing'],
    language: 'en',
    protocol: 'https'
  };

  if (environment === 'development') {
    ENV['ember-cli-mirage'] = { enabled: false, autostart: false };
    ENV.APP.API_HOST = 'https://otb.org:3000';
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV['ember-cli-mirage'] = {
      enabled: false
    };

    ENV['g-map'] = ENV['ember-google-maps'];
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
    ENV['ember-cli-mirage'] = { enabled: true, autostart: true };
    ENV.APP.API_HOST = '';
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'staging') {
    ENV.APP.API_HOST = 'https://otb-api.ecdsdev.org';
    ENV.APP.FRONTEND_HOST = 'opentour.site';
    ENV['ember-cli-mirage'] = { enabled: false, autostart: false };

    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV['ember-google-maps'] = {
      key: 'AIzaSyD-G_lDtvChv-P3nchtQYHoCLfFzn9ylr8',
      libraries: ['places'],
      language: 'en',
      protocol: 'https'
    };

    ENV['g-map'] = ENV['ember-google-maps'];
    ENV['fauxOAuth'].tokenValidationUrl = 'https://otb-api.ecdsdev.org/auth/verify/';
    ENV['fauxOAuth'].tokenAuthUrl = 'https://otb-api.ecdsdev.org/auth/tokens/';
    ENV['fauxOAuth'].redirectUrl = 'https://otb.ecdsdev.org/admin/torii/redirect.html';

  }

  if (environment === 'production') {
    ENV.APP.API_HOST = 'https://api.opentour.site';
    ENV['ember-cli-mirage'] = { enabled: false, autostart: false };
    ENV['g-map'] = ENV['ember-google-maps'];
    ENV['fauxOAuth'].tokenValidationUrl = 'https://api.opentour.site/auth/verify/';
    ENV['fauxOAuth'].tokenAuthUrl = 'https://api.opentour.site/auth/tokens/';
    ENV['fauxOAuth'].redirectUrl = 'https://opentour.site/admin/torii/redirect.html';

    ENV.APP.FRONTEND_HOST = 'opentour.site';
    ENV['ember-cli-mirage'] = { enabled: false, autostart: false };

    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV['ember-google-maps'] = {
      key: 'AIzaSyD-G_lDtvChv-P3nchtQYHoCLfFzn9ylr8',
      libraries: ['places'],
      language: 'en',
      protocol: 'https'
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
