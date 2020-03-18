import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { task } from 'ember-concurrency';

@classic
export default class IndexRoute extends Route {
  @service
  currentUser;

  @service
  tenant;

  // beforeModel() {
  //   // this.get('tenant').setTenant();
  //   return this.get('currentUser').load();
  // },

  // model() {
  //   if (this.get('currentUser.user.super')) {
  //     return {
  //       tours: this.get('getTours').perform(),
  //       tourSets: this.get('getTourSets').perform()
  //     };
  //   } else {
  //     return {
  //       tours: this.get('getTours').perform()
  //     };
  //   }
  // },

  @task(function*() {
    // if (!this.currentUser.user.current_tenant_admin) return;
    return yield this.store.findAll('tour');
  })
  getTours;

  @task(function*() {
    if (!this.currentUser.user.tour_sets && !this.currentUser.user.super) {
      return yield this.getTours.perform();
    }
    return yield this.store.findAll('tour-set');
  })
  getTourSets;
}
