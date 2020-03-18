import classic from 'ember-classic-decorator';
import { sort } from '@ember/object/computed';
import Model, { hasMany, attr } from '@ember-data/model';
import { get, computed } from '@ember/object';
import ENV from '../config/environment';

@classic
export default class Stop extends Model {
  @attr('string')
  title;

  @attr('string')
  slug;

  @attr('number', {
    defaultValue: 0.0
  })
  lat;

  @attr('number', {
    defaultValue: 0.0
  })
  lng;

  @attr('number')
  parking_lat;

  @attr('number')
  parking_lng;

  @attr('string')
  address;

  @attr('string', {
    defaultValue: ''
  })
  description;

  @attr('string')
  sanitized_description;

  @attr('string')
  sanitized_direction_notes;

  @attr('string')
  meta_description;

  @attr('string')
  article_link;

  @attr('string')
  video_embed;

  @attr('string')
  video_poster;

  @attr('string')
  direction_intro;

  @attr('string')
  direction_notes;

  @hasMany('tour')
  tours;

  @hasMany('tour_stop', {
    async: true
  })
  tour_stops;

  @hasMany('stop_medium', {
    async: true
  })
  stop_media;

  @hasMany('medium', {
    async: true
  })
  media;

  @attr()
  splash;

  @computed('original_image')
  get mobileThumbUrl() {
    return `${
      ENV.APP.API_HOST
    }${get(this, 'splash.original_image.mobile_list_thumb.url')}`;
  }

  set mobileThumbUrl(v) {
    return v;
  }

  @sort('stop_media', '_mediumPositionSort')
  sortedMedia;

  _mediumPositionSort = ['position:asc'];
}
