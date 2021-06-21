import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ThemePicker extends Component {
  @service
  theme;

  @action
  setTheme(theme) {
    this.args.model.setProperties({ theme: theme });
    this.args.save.perform(this.args.model);
  }
}
