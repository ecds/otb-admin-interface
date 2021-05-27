import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { action } from '@ember/object';

export default class EditRoute extends Route {

  model(params) {
    return RSVP.hash({
      tour: this.store.findRecord('tour', params.tour_id),
      modes: this.store.findAll('mode')
    });
  }

  async afterModel(model) {
    let extra = await RSVP.hash({
      media: this.store.findAll('medium'),
      stops: this.store.findAll('stop')
    });

    Object.assign(model, extra);
  }

  @action
  doNothing() {
    return true;
  }
}
