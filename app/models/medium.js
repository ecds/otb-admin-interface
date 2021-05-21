import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Model, { hasMany, attr } from '@ember-data/model';
import { htmlSafe } from '@ember/string';
import ENV from '../config/environment';

export default class Medium extends Model {
  @service
  tenant;

  @attr('string')
  title;

  @attr('string')
  caption;

  @attr('string')
  video;

  @attr()
  original_image;

  @attr('string')
  embed;

  @attr('string')
  desktop;

  @attr('string')
  tablet;

  @attr('string')
  mobile;

  @attr('string')
  srcset;

  @attr('string')
  srcset_sizes;

  @attr('string')
  base64;

  // stop: attr(),
  @hasMany('tour', { async: true })
  tours;

  @hasMany('stop', { async: true })
  stops;

  @attr('boolean', { defaultValue: false })
  loadEmbed;

  @computed('original_image')
  get baseUrl() {
    return `${ENV.APP.API_HOST}`;
  }

  set baseUrl(v) {
    return v;
  }

  @computed('embed')
  get safeEmbed() {
    return htmlSafe(this.embed);
  }

  set safeEmbed(v) {
    return v;
  }

  @computed('')
  get remote_original_image_url() {
    return this.original_image.url
  }

  set remote_original_image_url(v) {
    return v;
  }
}
