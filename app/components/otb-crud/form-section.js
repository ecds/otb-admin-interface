import classic from 'ember-classic-decorator';
import { classNames, tagName } from '@ember-decorators/component';
import Component from '@ember/component';
import { assert } from '@ember/debug';
import { get, computed } from '@ember/object';
import { dasherize } from '@ember/string';

@classic
@tagName('section')
@classNames('uk-margin-bottom')
export default class FormSection extends Component {
  init() {
    super.init(...arguments);
    assert('Component form-section must be passed a label', get(this, 'label'));
  }

  @computed('label')
  get inputId() {
    return `${this.elementId}-${dasherize(get(this, 'label'))}`;
  }
}
