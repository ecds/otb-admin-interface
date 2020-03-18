import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import { get, set, action } from '@ember/object';
import Component from '@ember/component';
import UIkit from 'uikit';

@classic
export default class CrudActions extends Component {
  @service
  store;

  @action
  saveModel(model) {
    model.save().then(() => {
      UIkit.notification({
        message: `${model.title} Saved!`,
        status: 'success'
      });
    }),
    /* eslint-disable */
    // Prettier wants spaces, but then complains about indentation
    error => {
      UIkit.notification({
        message: `ERROR: ${error.message}`,
        stauts: 'danger'
      });
    };
    /* eslint-enable */
  }
}
