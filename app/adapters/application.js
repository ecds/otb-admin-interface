import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { get, computed } from '@ember/object';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from '../config/environment';

@classic
export default class Application extends JSONAPIAdapter.extend(DataAdapterMixin) {
  @service
  fastboot;

  @service
  tenant;

  // @(computed('').volatile())
  get host() {
    return `${ENV.APP.API_HOST}/${this.tenant.tenant}`;
  }

  @computed('session.data.authenticated.access_token')
  get headers() {
    let { access_token } = this.get('session.data.authenticated');
    return {
      'Authorization': `Bearer ${access_token}`
    }
  }

  set headers(v) {
    return v
  }
}
