import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get, action, computed } from '@ember/object';
import ENV from '../config/environment';

@classic
export default class UploadForm extends Component {
  stop = null;

  @service
  store;

  @service
  tenant;

  @computed('')
  get endpoint() {
    return `https://${this.get('tenant.domain')}.${ENV.APP.API_HOST}/media`;
  }

  @action
  setStop(stop) {
    this.set('stop', stop);
  }

  @action
  uploadImage() {
    // let photo = get(this, 'store').createRecord('medium', {
    //   title: file.name,
    //   original_image: file
    // });
    // photo.save().then(() => {
    //   file.id = photo.id;
    // });
  }

  @action
  uploadSuccess(file) {
    let response = JSON.parse(file.xhr.response);
    let store = get(this, 'store');
    store
      .peekRecord('medium', response.data.id, {
        backgroundReload: false
      })
      .then(media => {
        media.setProperties({
          title: file.name,
          original_image: file
        });
        media.save();
      });
  }

  @action
  deleteImage(file) {
    const response = JSON.parse(file.xhr.response);
    const store = get(this, 'store');
    store
      .findRecord('medium', response.data.id, { backgroundReload: false })
      .then(function(image) {
        image.destroyRecord();
      });
  }
}
