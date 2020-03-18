import classic from 'ember-classic-decorator';
import GoogleOauth2BearerV2 from 'torii/providers/google-oauth2-bearer-v2';

@classic
export default class _GoogleOauth2BearerV2 extends GoogleOauth2BearerV2 {
  fetch(data) {
    return data;
  }
}
