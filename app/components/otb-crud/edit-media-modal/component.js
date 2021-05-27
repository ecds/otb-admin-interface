import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import UIKit from 'uikit';

export default class OtbCrudEditMediaModalComponent extends Component {
  @service crudActions;
  @service store;

  constructor() {
    super(...arguments);
    this.medium = this.store.peekRecord('medium', this.args.medium.get('id'));
  }

  medium = null;

  modal = null;

  @action
  initToggle(element) {
    UIKit.toggle(element, { target: `#edit-${this.args.medium.id}` });
  }

  @action
  initModal(element) {
    this.modal = UIKit.modal(element);
    UIKit.util.on(this.modal, 'hidden', () => this.cancelEdit.perform());
  }

  @task
  *saveMedium() {
    yield this.crudActions.saveRecord.perform(this.args.medium);
    yield this.crudActions.saveRecord.perform(this.medium);
    yield this.modal.hide();
  }

  @task
  *cancelEdit() {
    yield this.crudActions.rollback.perform(this.args.medium);
    yield this.crudActions.rollback.perform(this.medium);
    yield this.modal.hide();
  }
}
