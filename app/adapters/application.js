import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from '../config/environment';

const { JSONAPIAdapter } = DS;

export default JSONAPIAdapter.extend(DataAdapterMixin, {
  fastboot: service(),
  tenant: service(),

  host: computed('', function() {
    return `${ENV.APP.API_HOST}/${get(this, 'tenant.tenant')}`;
  }),

  authorize(xhr) {
    let { access_token } = this.get('session.data.authenticated');
    xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
  }
});
