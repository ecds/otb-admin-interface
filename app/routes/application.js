import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';

export default class ApplicationRoute extends Route {
  @service currentUser;
  @service tenant;
  @service media;
  @service intl;
  @service session

  beforeModel(transisition) {
    super.beforeModel(...arguments);

    // Transition to the Login Route if unauthenticated.
    this.session.requireAuthentication('login', 'login');

    this.__setTenant(transisition);
    this.intl.setLocale(['en-us']);
    return this.currentUser.load.perform();
  }

  @action
  willTransition(transisition) {
    this.__setTenant(transisition);
  }

  __setTenant(transisition) {
    // The admin routes are the only ones where we will be switching tenants.
    // Also, the rootUrl for non admin routes will always come after the tenant in the
    if (window.location.pathname.split('/')[1] === 'admin') {
      if (transisition.hasOwnProperty('intent')) {
        if (
          transisition.intent.hasOwnProperty('contexts') &&
          isPresent(transisition.intent.contexts)
        ) {
          // Link from TourSet List
          this.tenant.setTenantFromContext(transisition.intent.contexts);
        } else if (isEmpty(transisition.intent)) {
          this.tenant.setTenant();
        } else if (transisition.intent.hasOwnProperty('name')) {
          this.tenant.setTenant(
            transisition.intent.name.replace(/\./g, '/')
          );
        } else if (transisition.intent.hasOwnProperty('url')) {
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
