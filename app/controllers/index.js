import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import ENV from '../config/environment';

export default class IndexController extends Controller {
  @service
  tenant;

  baseUrl = ENV.APP.API_HOST;

  @action
  newTourSet() {
    this.store.createRecord('tour-set', { name: 'foo' });
  }
}
