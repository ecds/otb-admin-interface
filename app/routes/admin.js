import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

@classic
export default class AdminRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  session;

  @service
  currentUser;

  sessionAuthenticated() {
    undefined;
    return this.currentUser.load();
  }
}
