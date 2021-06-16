import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import UIkit from 'uikit';

export default class IndexController extends Controller {
  @service crudActions;
  @service tenant;

  @task(function*() {
    let newTour = this.store.createRecord('tour');
    yield newTour.save();
    return this.transitionToRoute(
      'admin.tours.edit',
      this.tenant.tenant,
      newTour.id
    );
  }) createTour;

  @task
  *upload(file) {
    yield this.crudActions.uploadFile.perform(this.tenant.tenantModel, file, 'tour-set', false, 'logoTitle', false);
  }

  @action
  togglePublish() {
    //
  }

  @action
  deleteTour(tour) {
    UIkit.modal.confirm(`Delete ${tour.title}?`).then(
      () => {
        tour.destroyRecord();
      },
      () => {
        // console.log('Rejected.');
      }
    );
  }
}
