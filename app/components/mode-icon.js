import classic from 'ember-classic-decorator';
import { tagName, layout as templateLayout } from '@ember-decorators/component';
import Component from '@ember/component';
import layout from '../templates/components/mode-icon';
import { get, set } from '@ember/object';

@classic
@templateLayout(layout)
@tagName('')
export default class ModeIcon extends Component {
  icon = null;

  didInsertElement() {
    const mode = this.mode;
    if (mode === 'BICYCLING') {
      set(this, 'icon', 'bicycle');
    } else if (mode === 'DRIVING') {
      set(this, 'icon', 'car');
    } else if (mode === 'TRANSIT') {
      set(this, 'icon', 'bus');
    }
  }
}
