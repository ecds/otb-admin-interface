import classic from 'ember-classic-decorator';
import FacebookOauth2Provider from 'torii/providers/facebook-oauth2';

@classic
export default class FacebookOauth2 extends FacebookOauth2Provider {
  fetch(data) {
    return data;
  }
}
