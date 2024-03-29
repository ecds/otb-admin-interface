import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class EditRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      tour: this.store.findRecord('tour', params.tour_id),
      modes: this.store.findAll('mode'),
      mapIcons: this.store.findAll('mapIcon'),
      users: this.store.findAll('user'),
      tourAuthors: this.store.findAll('tour-author')
    });
  }

  async afterModel(model) {
    // let extra = await RSVP.hash({
    // });

    // Object.assign(model, extra);

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
