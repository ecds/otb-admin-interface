import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Controller from '@ember/controller';
import CrudActionsMixin from '../../../mixins/crud-actions';

@classic
export default class IndexController extends Controller.extend(CrudActionsMixin) {
  @action
  doNothing() {
    return true;
  }
}
