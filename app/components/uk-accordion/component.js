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
    if (this.args.onShown) {
      UIkit.util.on(element, 'shown', this.args.onShown);
    }
    if (this.args.onHide) {
      UIkit.util.on(element, 'beforehide', this.args.onHide);
    }
    if (this.args.onBeforeshow) {
      UIkit.util.on(element, 'beforeshow', this.args.onBeforeshow);
    }
  }
}
