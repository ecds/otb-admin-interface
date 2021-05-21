import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { action } from '@ember/object';

export default class EditRoute extends Route {

  model(params) {
    return RSVP.hash({
      tour: this.store.findRecord('tour', params.tour_id)
    });

  }

  @action
  doNothing() {
    return true;
  }
}
