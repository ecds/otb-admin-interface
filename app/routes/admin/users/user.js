import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class UserRoute extends Route {
  model(params) {
    return this.store.findRecord('user', params.user_id);
  }
}
