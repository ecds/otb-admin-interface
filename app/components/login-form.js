import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { classNames, tagName } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

@classic
@tagName('')
@classNames('login-form')
export default class LoginForm extends Component {
  @service
  session;

  @service
  currentUser;

  authenticating = false;

  @action
  authenticateWithFacebook() {
    this.set('authenticating', true);
    this.session
      .authenticate('authenticator:torii', 'facebook-oauth2')
      .then(
        () => {
          this.set('authenticating', false);
          this.currentUser.load();
        },
        e => {
          this.set('authenticating', false);
          this.set('errorMessage', e.error || e);
        }
      );
  }

  @action
  authenticateWithGoogle() {
    this.set('authenticating', true);
    this.session
      .authenticate('authenticator:torii', 'google-oauth2-bearer-v2')
      .then(
        () => {
          this.set('authenticating', false);
          this.currentUser.load();
        },
        e => {
          this.set('authenticating', false);
          this.set('errorMessage', e.error || e);
        }
      );
  }
}
