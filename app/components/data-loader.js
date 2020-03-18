import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task } from 'ember-concurrency';

@classic
@tagName('')
export default class DataLoader extends Component {
  @service
  store;

  init() {
    super.init(...arguments);
    this.data = [];
  }

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
  }

  @(task(function*(modelName) {
    let records = yield this.store.findAll(modelName);
    return this.set('data', records);
  }).restartable())
  fetchAll;

  @(task(function*(modelName, param) {
    let record = yield this.store.findRecord(modelName, param);
    let model = this.set('data', record);
    this.set('model', model);
    return model;
  }).restartable())
  fetchRecord;

  @task(function*(modelName, param) {
    let records = yield this.store.findAll(modelName, {
      search: param
    });
    return this.set('data', records);
  })
  searchRecords;
}
