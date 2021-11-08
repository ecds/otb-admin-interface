import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class UserRoute extends Route {
  model(params) {
    return RSVP.hash({
      user: this.store.findRecord('user', params.user_id),
      tourSets: this.store.findAll('tourSet')
    });
  }
}
