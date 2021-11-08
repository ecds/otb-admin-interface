import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class LoginRoute extends Route {
  @service router;
  @service session;

  beforeModel(/*transition*/) {
    this.session.prohibitAuthentication('admin');
  }
}
