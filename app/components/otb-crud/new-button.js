import classic from 'ember-classic-decorator';
import { classNames, attributeBindings, tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('button')
@classNames('uk-button', 'uk-button-primary')
@attributeBindings('type')
export default class NewButton extends Component {
  type = 'button';

  click() {
    this.dataTask();
  }
}
