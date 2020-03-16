import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { task } from 'ember-concurrency';
// import { inject as service } from '@ember/service';

@classic
export default class EditRoute extends Route {
  // tenant: service(),

  // beforeModel() {
  //   this._super(...arguments);
  //   this.store.unloadAll('tour');
  // },

  model(params) {
    // return this.store.findRecord('tour', params.tour_id);
    return {
      modelId: params.tour_id
    };
  }

  @task(function*(params) {
    try {
      return yield this.store.findRecord('tour', params.tour_id);
    } catch (nah) {
      return nah;
    }
  })
  getModel;

  @action
  doNothing() {
    return true;
  }
}
