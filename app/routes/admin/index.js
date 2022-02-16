import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service currentUser;
  @service store;

  async beforeModel() {
    return await this.currentUser.load.perform();
  }

  model() {
    return RSVP.hash({
      // tours: this.store.findAll('tour'),
      tourSets: this.store.findAll('tour-set')
    });
  }

  // async afterModel(model) {
  //   if (!this.currentUser.user.super) {
  //     model.tours = [];
  //     await this.currentUser.user.allTours.forEach((tour) => {
  //       model.tours.push(
  //         this.store.queryRecord('tour', { tour: tour.tour, tourTenant: tour.tenant })
  //       );
  //     });
  //   }
  // }
}
