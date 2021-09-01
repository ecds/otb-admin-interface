import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import UIkit from 'uikit';

export default class IndexController extends Controller {
  @service crudActions;
  @service router;
  @service tenant;

  @tracked
  transitioning = false;

  constructor() {
    super(...arguments);

    this.router.on('routeWillChange', () => {
      this.transitioning = true;
    });

    this.router.on('routeDidChange', () => {
      this.transitioning = false;
    });
  }

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
    this.tenant.tenantModel.setProperties({ logo: null });
    yield this.crudActions.uploadFile.perform(this.tenant.tenantModel, file, 'tour-set', false, 'logoTitle', false);
  }

  @task
  *removeSiteIcon() {
    this.tenant.tenantModel.setProperties({ logo: null, base_sixty_four: null });
    yield this.tenant.tenantModel.save();
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
