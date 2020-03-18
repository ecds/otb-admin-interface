import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get, action } from '@ember/object';

@classic
export default class LoginButton extends Component {
  @service
  session;

  @action
  logOut() {
    this.session.invalidate();
  }
}
