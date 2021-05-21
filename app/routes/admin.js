import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdminRoute extends Route {
  @service session;
  @service currentUser;

  sessionAuthenticated() {
    undefined;
    return this.currentUser.load.perform();
  }
}
