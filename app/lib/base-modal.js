import Component from '@glimmer/component';
import { action } from '@ember/object';
import UIKit from 'uikit';

export default class BaseModalComponent extends Component {
  modal = null;

  @action
  initToggle(element) {
    UIKit.toggle(element, { target: `#${this.args.modalId}` });
  }

  @action
  initModal(element) {
    this.modal = UIKit.modal(element);
  }
}
