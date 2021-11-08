import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class UserController extends Controller {
  @service crudActions;

  @action
  addRemoveSet(parent, child, event) {
    let options = {
      relationType: event.target.name,
      parentObj: parent,
      childObj: child
    };
    if (event.target.checked) {
      this.crudActions.createHasMany.perform(options);
    } else {
      this.crudActions.deleteHasMany.perform(options);
    }
  }
}
