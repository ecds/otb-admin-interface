import Model, { hasMany, attr } from '@ember-data/model';

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
  parkingLat;

  @attr('number')
  parkingLng;

  @attr('string')
  address;

  @attr('string', {
    defaultValue: ''
  })
  description;

  @attr('string')
  metaDescription;

  @attr('string')
  article_link;

  @attr('string')
  video_embed;

  @attr('string')
  video_poster;

  @attr('string')
  direction_intro;

  @attr('string')
  directionNotes;

  @hasMany('tour')
  tours;

  @hasMany('tour-stop', {
    async: true
  })
  tourStops;

  @hasMany('stop-medium', {
    async: true
  })
  stopMedia;

  @hasMany('medium', {
    async: true
  })
  media;

  @attr()
  splash;

  // get mobileThumbUrl() {
  //   return `${ENV.APP.API_HOST}${this.splash.original_image.mobile_list_thumb.url}`;
  // }

  // set mobileThumbUrl(v) {
  //   return v;
  // }

  get sortedMedia() {
    return this.stopMedia.sortBy('position');
  }
}
