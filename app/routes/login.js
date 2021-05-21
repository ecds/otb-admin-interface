import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class LoginRoute extends Route {
  @service router;

  constructor() {
    super(...arguments);

    this.router.on('routeDidChange', (transition) => {
      this.controllerFor('login').set('openModal', true)
    })
  }
}
