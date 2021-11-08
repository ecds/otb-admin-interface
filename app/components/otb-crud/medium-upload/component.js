import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MediumUpload extends Component {
  @service fileQueue;

  @action
  upload(file) {
    this.args.uploadTask.perform(this.args.model, file);
  }
}
