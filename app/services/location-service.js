import classic from 'ember-classic-decorator';
import Service, { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';

@classic
export default class LocationServiceService extends Service {
  @service
  cookies;

  @service
  geoLocation;

  tour = null;

  init() {
    super.init(...arguments);
  }

  @computed('Declined', 'Acknowledged')
  get allowed() {
    let cookie = get(this, 'cookies').read(`${get(this, 'tour')}-Allowed`);
    if (cookie === 'yup') {
      get(this, 'geoLocation').getLocation();
      return true;
    } else if (cookie === 'nope') {
      return false;
    }
    return undefined;
  }

  set allowed(v) {
    return v;
  }

  setAllowed(title) {
    get(this, 'cookies').write(`${title}-Allowed`, 'yup');
  }
}
