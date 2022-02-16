import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default class UserRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      user: this.store.findRecord('user', params.user_id),
      tourSets: this.store.findAll('tourSet')
    });
  }
}
