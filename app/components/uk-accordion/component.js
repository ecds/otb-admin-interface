import Component from '@glimmer/component';
import { action } from '@ember/object';
import UIkit from 'uikit';

export default class UkAccordion extends Component {
  ukAccordion = null;

  @action
  initAccordion(element) {
    let options = {
      targets: this.args.targets
    };
    this.ukAccordion = UIkit.accordion(element, options);
  }
}
