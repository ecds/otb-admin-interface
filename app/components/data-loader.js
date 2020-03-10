import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: '',
  store: service(),
  init() {
    this._super(...arguments);
    this.data = [];
  },

  didReceiveAttrs() {
    switch (this.queryType) {
      case 'all':
        this.fetchAll.perform(this.modelName);
        break;
      case 'fetchRecord':
        this.fetchRecord.perform(this.modelName, this.param);
        break;
      case 'search':
        this.searchRecords.perform(this.modelName, this.param);
        break;
      default:
        return true;
    }
  },

  fetchAll: task(function*(modelName) {
    let records = yield this.store.findAll(modelName);
    return this.set('data', records);
  }).restartable(),

  fetchRecord: task(function*(modelName, param) {
    let record = yield this.store.findRecord(modelName, param);
    let model = this.set('data', record);
    this.set('model', model);
    return model;
  }).restartable(),

  searchRecords: task(function*(modelName, param) {
    let records = yield this.store.findAll(modelName, {
      search: param
    });
    return this.set('data', records);
  })
});
