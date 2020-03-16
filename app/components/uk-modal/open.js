import classic from 'ember-classic-decorator';
import { classNames, attributeBindings, tagName, layout as templateLayout } from '@ember-decorators/component';
import Component from '@ember/component';
import { get, set } from '@ember/object';
import layout from '../../templates/components/uk-modal/open';

@classic
@templateLayout(layout)
@tagName('button')
@classNames('uk-button', 'uk-button-default')
@attributeBindings('targetModal:target', 'ukToggle:uk-toggle')
export default class Open extends Component {
  ukToggle = '';

  didInsertElement() {
    set(this, 'targetModal', `#${get(this, 'parent.modalName')}`);
  }
}
