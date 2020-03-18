import classic from 'ember-classic-decorator';
//app/medium/adapter.js
import ApplicationAdapter from './application';
import FormDataAdapterMixin from 'ember-cli-form-data/mixins/form-data-adapter';

@classic
export default class MediumBk extends ApplicationAdapter.extend(FormDataAdapterMixin) {}
