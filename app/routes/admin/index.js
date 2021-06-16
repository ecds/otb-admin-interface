import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service currentUser;

  model() {
    if (this.currentUser.user.super) {
      return RSVP.hash({
        // tours: this.store.findAll('tour'),
        tourSets: this.store.findAll('tour-set')
      });
    }
    return {};
  }
}
