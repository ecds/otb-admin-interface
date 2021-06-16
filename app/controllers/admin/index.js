import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

export default class IndexController extends Controller {
  @service crudActions;
  @service tenant;
  @service currentUser;

  @tracked
  showNewSiteModal = false;

  @tracked
  newSiteName = null;

  @tracked
  error = false;

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
    if (this.newSiteName) {
      this.error = false;
      let newSite = yield this.crudActions.newRecord.perform('tourSet', { name: this.newSiteName });
      this.modelsToUnload.forEach(model => {
        this.store.unloadAll(model);
      });
      this.currentUser.load.perform();
      this.showNewSiteModal = false;
      return this.transitionToRoute('admin.tours.index', newSite.subdir);
    } else {
      this.error = true;
    }
  }
}
