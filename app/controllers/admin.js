import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

@classic
export default class AdminController extends Controller {
  @service
  tenant;

  @service
  session;

  @action
  saveSomeThing(model) {
    model.save();
  }
}
