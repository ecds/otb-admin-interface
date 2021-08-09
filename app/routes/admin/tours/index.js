import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class IndexRoute extends Route {
  @service tenant;

  beforeModel() {
    this.tenant.setTenant();
  }

  model() {
    return RSVP.hash({
      tour: this.store.findAll('tour'),
      users: this.store.findAll('user')
    });
  }
}
