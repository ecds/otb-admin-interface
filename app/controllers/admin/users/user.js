import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Controller from '@ember/controller';
import CrudActionsMixin from '../../../mixins/crud-actions';

@classic
export default class UserController extends Controller.extend(CrudActionsMixin) {
  @action
  addRemoveSet(parent, child, event) {
    let options = {
      relationType: event.target.name,
      parentObj: parent,
      childObj: child
    };
    if (event.target.checked) {
      this.createHasMany.perform(options);
    } else {
      this.deleteHasMany.perform(options);
    }
  }
}
