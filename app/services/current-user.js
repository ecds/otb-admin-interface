import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  @service('session')
  session;

  @service
  store;

  @tracked user = null;

  @task
  *load() {
    if (this.session.isAuthenticated) {
      this.user = yield this.store.queryRecord('user', { me: true });
      return this.user;
    }
    return false;
  }

  @task
  *reLoad() {
    let user = yield this.store.queryRecord('user', { me: true });
    this.store.unloadRecord(user);
    this.load.perform();
  }

  update() {
    const user = this.store.peekRecord('user', this.user.id);
    user.save();
  }
}
