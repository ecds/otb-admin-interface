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
      flatPages: this.store.findAll('flatPage'),
      stops: this.store.findAll('stop'),
      media: this.store.findAll('medium'),
      mapIcons: this.store.findAll('mapIcon')
    });

    Object.assign(model, extra);

    model.tour.tourMedia.forEach((tourMedium) => {
      if (tourMedium.id) {
        this.store.findRecord('tour-medium', tourMedium.id);
      }
    });
    model.tour.tourStops.forEach((tourStop) => {
      this.store.findRecord('tour-stop', tourStop.id);
    });

  }

  @action
  doNothing() {
    return true;
  }
}
