import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

@classic
export default class IndexRoute extends Route {
  @service
  tenant;

  beforeModel() {
    this.tenant.setTenant();
  }

  model() {
    return this.store.queryRecord('tour-set', { subdir: this.tenant.tenant });
  }
}
