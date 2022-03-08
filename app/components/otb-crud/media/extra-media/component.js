import UIKit from 'uikit';
import BaseModalComponent from '../../../../lib/base-modal';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class OtbCrudMediaExtraMediaComponent extends BaseModalComponent {
  @service crudActions;
  @service store;

  @tracked
  media = null;

  @tracked
  loading = true;

  @action
  initModal(element) {
    this.modal = UIKit.modal(element);
    UIKit.util.on(element, 'beforeshow', () => this.fetchMedia.perform());
  }

  @action
  addImage(image) {
    this.crudActions.createHasMany.perform({
      parentObj: this.args.model,
      childObj: image,
      relationType: 'medium'
    });
  }

  @task
  *fetchMedia() {
    const media = yield this.store.findAll('medium');
    this.media = media;
  }

  @action
  imgLoaded() {
    this.loading = false;
  }
}
