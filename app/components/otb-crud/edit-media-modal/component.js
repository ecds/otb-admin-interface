import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import UIKit from 'uikit';

export default class OtbCrudEditMediaModalComponent extends Component {
  @service crudActions;
  @service store;

  @tracked
  modalShowing = false;

  medium = null;

  constructor() {
    super(...arguments);
    this.medium = this.store.peekRecord('medium', this.args.medium.get('id'));
  }

  medium = null;

  modal = null;

  @action
  initToggle(element) {
    UIKit.toggle(element, { target: `#edit-medium-for-${this.args.parentObj.slug}-${this.args.medium.id}` });
  }

  @action
  initModal(element) {
    this.modal = UIKit.modal(element, { bgClose: false, escClose: false });
    UIKit.util.on(element, 'beforeshow', this.setUp);
    UIKit.util.on(element, 'beforehide', this.tearDown);
  }

  @action
  setUp() {
   this.medium = this.store.peekRecord('medium', this.args.medium.get('medium.id'));
   this.modalShowing = true;
 }

 @action
 tearDown() {
  this.modalShowing = false;
 }

 @action
 rollback() {
  this.cancelEdit.perform();
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
    this.args.medium.setProperties({ loaded: true });
  }
}
