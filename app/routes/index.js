
import Route from '@ember/routing/route';
import ENV from '../config/environment';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service store;

  model() {
    return this.store.findAll('tour');
  }

  redirect(model) {
    const currentLoc = `${window.location.hostname}:${window.location.port}`;
    const externalUrl = model.firstObject.externalUrl;
    if (externalUrl && ENV.APP.TENANT && currentLoc !== externalUrl) {
      window.location.replace(`http://${externalUrl}`);
    }
  }

  // setupController(controller, model) {
  //   super.setupController(controller, model);
  //   this.controllerFor('index').set('toursSorting', ['position']);
  //   if (this.controller.sortedTours === undefined) {
  //     this.controllerFor('index').set(
  //       'sortedTours',
  //       sort('model', 'toursSorting')
  //     );
  //   }
  // }

  // @action
  // didTransition() {
  //   let sortedTours = this.controller.sortedTours;
  //   sortedTours.forEach((tour, index) => {
  //     tour.setProperties({
  //       show: false
  //     });
  //     run.later(
  //       this,
  //       () => {
  //         if (!tour.isDestroyed) {
  //           tour.setProperties({
  //             show: true
  //           });
  //         }
  //       },
  //       300 * index
  //     );
  //   });
  // }
}
