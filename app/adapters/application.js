import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from '../config/environment';

export default JSONAPIAdapter.extend(DataAdapterMixin, {
  fastboot: service(),
  tenant: service(),

  host: computed('', function() {
    return `${ENV.APP.API_HOST}/${this.tenant.tenant}`;
  }).volatile(),

  headers: computed('session.data.authenticated.access_token', function(){
    let { access_token } = this.get('session.data.authenticated');
    return {
      'Authorization': `Bearer ${access_token}`
    }
  })
});
