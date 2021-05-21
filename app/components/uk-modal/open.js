import Component from '@ember/component';
import { get, set } from '@ember/object';
import layout from '../../templates/components/uk-modal/open';





export default class Open extends Component {
  ukToggle = '';

  didInsertElement() {
    set(this, 'targetModal', `#${get(this, 'parent.modalName')}`);
  }
}
