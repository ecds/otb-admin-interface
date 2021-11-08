import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { dasherize } from '@ember/string';

export default class FormSection extends Component {
  constructor() {
    super(...arguments);
    assert('Component form-section must be passed a label', this.args.label);
  }

  get inputId() {
    return `${this.elementId}-${dasherize(this.args.label)}`;
  }

  set inputId(v) {
    return v;
  }
}
