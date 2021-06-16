import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import UIKit from 'uikit';

export default class MapIconsComponent extends Component {
  @task
  *upload(file) {
    const newIcon = yield this.args.upload.perform(this.args.model, file, 'mapIcon', false);
    if (newIcon) {
      yield this.args.addToModel.perform(this.args.model, newIcon, 'mapIcon');
    }
  }

  @action
  addIcon(icon) {
    this.args.addToModel.perform(this.args.model, icon, 'mapIcon');
  }

  @action
  initToggle(element) {
    UIKit.toggle(element, { target: `#existing-icons-${this.args.model.get('slug')}${this.args.model.get('id')}` });
  }

  @action
  initModal(element) {
    this.modal = UIKit.modal(element);
  }
}
