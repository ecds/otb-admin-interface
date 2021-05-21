import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from '../config/environment';

export default class Public extends JSONAPIAdapter {
  host = `${ENV.APP.API_HOST}/public`;
}
