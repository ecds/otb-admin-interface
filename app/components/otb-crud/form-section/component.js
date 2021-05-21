import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { get, computed } from '@ember/object';
import { dasherize } from '@ember/string';



export default class FormSection extends Component {
  init() {
    super.init(...arguments);
    assert('Component form-section must be passed a label', get(this, 'label'));
  }

  @computed('label')
  get inputId() {
    return `${this.elementId}-${dasherize(get(this, 'label'))}`;
  }

  set inputId(v) {
    return v;
  }
}
