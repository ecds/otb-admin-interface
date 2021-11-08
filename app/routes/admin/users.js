import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UsersRoute extends Route {
  @service currentUser;

  // Fail safe to prevent non-super users access to the user routes.
  beforeModel() {
    this.currentUser.load.perform();
    if (!this.currentUser.user.super) {
      this.transitionTo('admin');
    }
  }
}
