import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { inject as service } from '@ember/service';
// import { computed } from '@ember/object';
import ENV from '../config/environment';

export default class Application extends JSONAPIAdapter {
  @service tenant;


  // @computed
  get host() {
    this.tenant.setTenant();
    return `${ENV.APP.API_HOST}/${this.tenant.tenant}`;
  }

  ajaxOptions(/*defaultOptions, adapter*/) {
    const options = super.ajaxOptions(...arguments);
    options.credentials = 'include';

    return options;
  }

  // set headers(v) {
  //   return v
  // }
}
