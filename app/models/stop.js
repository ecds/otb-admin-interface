import Model, { belongsTo, hasMany, attr } from '@ember-data/model';

export default class Stop extends Model {
  @attr('string') title;
  @attr('string') slug;

  @attr('number', {
    defaultValue: 33.75432
  }) lat;

  @attr('number', {
    defaultValue: -84.38979
  }) lng;

  @attr('number') parkingLat;
  @attr('number') parkingLng;
  @attr('string') address;
  @attr('string') parkingAddress;
  @attr('string') iconColor;

  @attr('string', {
    defaultValue: ''
  }) description;

  @attr('string') metaDescription;
  @attr('string') article_link;
  @attr('string') video_embed;
  @attr('string') video_poster;
  @attr('string') direction_intro;
  @attr('string') directionNotes;
  @attr('boolean') orphaned;
  @hasMany('tour') tours;

  @hasMany('tour-stop', {
    async: true
  }) tourStops;

  @hasMany('stop-medium', {
    async: true
  }) stopMedia;

  @hasMany('medium', {
    async: true
  }) media;

  @belongsTo('mapIcon') mapIcon;

  @attr() splash;

  get isShared() {
    return this.tours.length > 1;
  }

  get sortedMedia() {
    return this.stopMedia.sortBy('position');
  }
}
