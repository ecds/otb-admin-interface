import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';

export default class ApplicationRoute extends Route {
  @service currentUser;
  @service tenant;
  @service media;
  @service intl;
  @service session

  constructor() {
    super(...arguments);
    this.on('routeWillChange', transisition => {
      this.__setTenant(transisition);
    });
  }

  beforeModel(transisition) {
    super.beforeModel(...arguments);

    // Transition to the Login Route if unauthenticated.
    this.session.requireAuthentication('login', 'login');

    this.__setTenant(transisition);
    this.intl.setLocale(['en-us']);
    this.session.one('authenticationSucceeded', () => (console.log('app route', this)));
    return this.currentUser.load.perform();
  }

  __setTenant(transisition) {
    // The admin routes are the only ones where we will be switching tenants.
    // Also, the rootUrl for non admin routes will always come after the tenant in the
    if (window.location.pathname.split('/')[1] === 'admin') {
      if (Object.hasOwnProperty.call(transisition, 'intent')) {
        if (
         Object.hasOwnProperty.call(transisition.intent, 'contexts') &&
          isPresent(transisition.intent.contexts)
        ) {
          // Link from TourSet List
          this.tenant.setTenantFromContext(transisition.intent.contexts);
        } else if (isEmpty(transisition.intent)) {
          this.tenant.setTenant();
        } else if (Object.hasOwnProperty.call(transisition.intent, 'name')) {
          this.tenant.setTenant(
            transisition.intent.name.replace(/\./g, '/')
          );
        } else if (Object.hasOwnProperty.call(transisition.intent, 'url')) {
          // Direct to admin.tour.index route
          this.tenant.setTenant(transisition.intent.url);
        } else {
          this.tenant.setTenant();
        }
      }
      // Most likely public UI
    } else {
      this.tenant.setTenant();
    }
  }
}
