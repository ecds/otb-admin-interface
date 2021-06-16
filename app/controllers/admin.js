import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class AdminController extends Controller {
  @service ecdsSession;
  @service session;
  @service tenant;

  @action
  signOut() {
    this.ecdsSession.invalidate();
  }
}
