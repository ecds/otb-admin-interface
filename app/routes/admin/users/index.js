import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

@classic
export default class IndexRoute extends Route {
  @service
  currentUser;

  model() {
    if (this.get('currentUser.user.super')) {
      return this.store.findAll('user');
    }
    return this.get('currentUser.user.tours');
  }
}
