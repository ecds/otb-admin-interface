import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class IndexController extends Controller {
  @service crudActions;
  @service tenant;

  @action
  doNothing() {
    return true;
  }
}
