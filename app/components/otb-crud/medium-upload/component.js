import { action } from '@ember/object';
import Component from '@ember/component';

export default class MediumUpload extends Component {
  @action
  upload(mod, file) {
    this.uploadTask.perform(mod, file);
  }
}
