import { get } from '@ember/object';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
  session: service('session'),
  store: service(),

  init() {
    this._super(...arguments);
  },

  load() {
    if (this.get('session.isAuthenticated')) {
      return this.store
        .queryRecord('user', { me: true })
        .then(user => {
          this.set('user', user);
        });
    }
    return false;
  },

  reLoad() {
    this.store
      .queryRecord('user', { me: true })
      .then(user => {
        this.store.unloadRecord(user);
        this.load();
      });
  },

  update() {
    const user = this.store.peekRecord('user', get(this, 'user.id'));
    user.save();
  }
});
