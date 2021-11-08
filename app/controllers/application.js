import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class ApplicationController extends Controller {
  @service session;
  @service taskMessage;

  @action
  invalidateSession() {
    this.session.invalidate();
  }
}
