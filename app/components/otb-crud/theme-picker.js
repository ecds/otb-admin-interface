import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

@classic
export default class ThemePicker extends Component {
  @service
  theme;

  @action
  setTheme(theme) {
    this.model.setProperties({ theme: theme });
    this.save.perform(this.model);
  }
}
