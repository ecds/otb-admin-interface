import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Component from '@ember/component';

@classic
export default class MediumUpload extends Component {
  @action
  upload(mod, file) {
    this.uploadTask.perform(mod, file);
  }
}
