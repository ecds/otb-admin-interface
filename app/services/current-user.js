import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  // @service ecdsSession;
  @service session;
  @service store;

  @tracked user = null;

  @task
  *load() {
    if (this.session.isAuthenticated) {
      try {
        this.user = yield this.store.queryRecord('user', { me: true });
        return this.user;
      } catch (error) {
        this.session.invalidate();
      }
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
