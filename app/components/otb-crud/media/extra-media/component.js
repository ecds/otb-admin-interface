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

  @tracked
  page = null;

  @tracked
  next = null;

  @tracked
  prev = null;

  @tracked
  current = 1;

  @tracked
  last = null;

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
  *fetchMedia(page=1) {
    this.media = null;
    this.loading = true;
    this.page = page;
    const media = yield this.store.query('medium', { page: this.page });
    this.current = this.getPageNumber(media.links.self);
    this.prev = this.getPageNumber(media.links.prev);
    this.next = this.getPageNumber(media.links.next);
    this.current = this.getPageNumber(media.links.self);
    this.last = this.getPageNumber(media.links.last);
    this.media = media;
    console.log("🚀 ~ file: component.js ~ line 53 ~ OtbCrudMediaExtraMediaComponent ~ *fetchMedia ~ this", media.links)
  }

  @action
  imgLoaded() {
    this.loading = false;
  }

  getPageNumber(link) {
    if (!link) return null;

    const url = new URL(link);
    return parseInt(url.searchParams.get('page[number]'));
  }
}
