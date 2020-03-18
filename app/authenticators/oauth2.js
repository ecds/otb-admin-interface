import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from '../config/environment';

@classic
export default class Oauth2 extends OAuth2PasswordGrant {
  @service
  tenant;

  serverTokenEndpoint = `${ENV.APP.API_HOST}/token`;
  serverTokenRevocationEndpoint = `${ENV.APP.API_HOST}/revoke`;
}
