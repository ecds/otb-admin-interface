import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import UIkit from 'uikit';
import CrudActionsMixin from '../../../mixins/crud-actions';

@classic
export default class IndexController extends Controller.extend(CrudActionsMixin) {
  @task(function*() {
    let newTour = this.store.createRecord('tour');
    yield newTour.save();
    return this.transitionToRoute(
      'admin.tours.edit',
      this.get('tenant.tenant'),
      newTour.id
    );
  })
  createTour;

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
        console.log('Rejected.');
      }
    );
  }
}
