import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service
  currentUser;

  @service
  tenant;

  beforeModel() {
    // this.get('tenant').setTenant();
    return this.currentUser.load.perform();
  }

  model() {
    const data = {
    }
    if (this.currentUser.user.super) {
      return RSVP.hash({
        // tours: this.store.findAll('tour'),
        tourSets: this.store.findAll('tour-set')
      })
    }
    return data;
  }
}
