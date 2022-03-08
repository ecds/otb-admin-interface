import UIKit from 'uikit';
import BaseModalComponent from '../../../lib/base-modal';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class OtbCrudExtraStopsComponent extends BaseModalComponent {
  @service store;

  @tracked
  items = null;

  @tracked
  loading = true;

  @action
  initModal(element) {
    this.modal = UIKit.modal(element);
    UIKit.util.on(element, 'beforeshow', () => this.fetchStops.perform());
  }

  @task
  *fetchStops() {
    let items = null;
    if (this.args.itemType == 'stop') {
      items = yield this.store.findAll('stop');
    } else {
      items = yield this.store.findAll('flatPage');
    }
    this.items = items;
  }

  @action
  stopsLoaded() {
    this.loading = false;
  }
}
