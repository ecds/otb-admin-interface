import classic from 'ember-classic-decorator';
import { sort } from '@ember/object/computed';
import Route from '@ember/routing/route';
import { run } from '@ember/runloop';
import { get, action } from '@ember/object';
import ENV from '../config/environment';

@classic
export default class IndexRoute extends Route {
  model() {
    return this.store.findAll('tour');
  }

  redirect(model) {
    const currentLoc = `${window.location.hostname}:${window.location.port}`;
    const externalUrl = model.firstObject.external_url;
    if (externalUrl && ENV.APP.TENANT && currentLoc !== externalUrl) {
      window.location.replace(`http://${externalUrl}`);
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    this.controllerFor('index').set('toursSorting', ['position']);
    if (get(this.controller, 'sortedTours') === undefined) {
      this.controllerFor('index').set(
        'sortedTours',
        sort('model', 'toursSorting')
      );
    }
  }

  @action
  didTransition() {
    let sortedTours = get(this.controller, 'sortedTours');
    sortedTours.forEach((tour, index) => {
      tour.setProperties({
        show: false
      });
      run.later(
        this,
        () => {
          if (!tour.isDestroyed) {
            tour.setProperties({
              show: true
            });
          }
        },
        300 * index
      );
    });
  }
}
