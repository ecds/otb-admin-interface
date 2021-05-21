import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default class ThemePicker extends Component {
  @service
  theme;

  @action
  setTheme(theme) {
    this.model.setProperties({ theme: theme });
    this.save.perform(this.model);
  }
}
