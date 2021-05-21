import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { A } from '@ember/array';
import { action } from '@ember/object';

export default class IndexController extends Controller {
  @service crudActions;
  @service tenant;
  @service currentUser;

  newSite = null;

  modelsToUnload = A([
    'flat-page',
    'medium',
    'mode',
    'stop',
    'stop-medium',
    'theme',
    'tour',
    'tour-flat-page',
    'tour-medium',
    'tour-stop',
    'user'
  ]);

  @task
  *createSite() {
    let newSite = yield this.newSite.save();
    this.modelsToUnload.forEach(model => {
      this.store.unloadAll(model);
    });
    this.currentUser.load.perform();
    return this.transitionToRoute('admin.tours.index', newSite.subdir);
  }

  @task
  *newSite() {
    this.newSite = yield this.store.createRecord('tour-set');
  }
}
