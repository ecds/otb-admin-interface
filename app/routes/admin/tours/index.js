import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  @service
  tenant;

  beforeModel() {
    this.tenant.setTenant();
  }

  model() {
    return this.store.findAll('tour');
  }
}
