import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import UIkit from 'uikit';

export default class TaskMessageService extends Service {
  @tracked
  message = null;

  modalElement = null;

  screenBlocker = null;

  constructor() {
    super(...arguments);
    this.modalElement = document.getElementById('task-running');
    this.screenBlocker = UIkit.modal(this.modalElement, {
      message: this.message,
      escClose: false,
      bgClose: false
    });
  }

  showModal() {
    this.screenBlocker.show();
  }
}
