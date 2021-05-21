import Route from '@ember/routing/route';

export default class UserRoute extends Route {
  model(params) {
    return this.store.findRecord('user', params.user_id);
  }
}
