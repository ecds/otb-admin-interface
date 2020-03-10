import Route from '@ember/routing/route';
import { isEmpty, isPresent } from '@ember/utils';
import { inject as service } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Route.extend(ApplicationRouteMixin, {
  currentUser: service(),
  tenant: service(),
  media: service(),
  intl: service(),

  beforeModel(transisition) {
    this._super(...arguments);
    this.__setTenant(transisition);
    this.intl.setLocale(['en-us']);
    return this.get('currentUser').load();
  },

  actions: {
    willTransition(transisition) {
      this.__setTenant(transisition);
    }
  },

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
          this.get('tenant').setTenantFromContext(transisition.intent.contexts);
        } else if (isEmpty(transisition.intent)) {
          this.get('tenant').setTenant();
        } else if (transisition.intent.hasOwnProperty('name')) {
          this.get('tenant').setTenant(
            transisition.intent.name.replace(/\./g, '/')
          );
        } else if (transisition.intent.hasOwnProperty('url')) {
          // Direct to admin.tour.index route
          this.get('tenant').setTenant(transisition.intent.url);
        } else {
          this.get('tenant').setTenant();
        }
      }
      // Most likely public UI
    } else {
      this.get('tenant').setTenant();
    }
  }
});
