import classic from 'ember-classic-decorator';
import { sort } from '@ember/object/computed';
import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { get, computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import ENV from '../config/environment';

@classic
export default class Tour extends Model {
  @attr('string')
  title;

  @attr('string')
  slug;

  @attr('string', {
    defaultValue: ''
  })
  description;

  @attr('string')
  sanitized_description;

  @attr('string')
  meta_description;

  @attr('string')
  sanitized_direction_notes;

  @attr('string')
  video;

  @attr('number')
  position;

  @attr('number')
  stop_count;

  @attr('string')
  theme_title;

  @hasMany('mode')
  modes;

  @attr()
  splash;

  @attr('string')
  external_url;

  @belongsTo('mode', {
    async: true,
    inverse: null
  })
  mode;

  @belongsTo('theme', {
    async: true
  })
  theme;

  @attr('string')
  tenant;

  @attr('string')
  tenant_title;

  @attr('boolean')
  published;

  @hasMany('tour-stop', {
    async: true
  })
  tour_stops;

  @hasMany('tour-medium')
  tour_media;

  @hasMany('medium', {
    async: true
  })
  media;

  @hasMany('stop', {
    async: true
  })
  stops;

  @hasMany('flat-page', {
    async: true
  })
  flat_pages;

  @hasMany('tour-flat-page')
  tour_flat_pages;

  @attr('string', {
    defaultValue: 'hybrid'
  })
  map_type;

  @hasMany('user')
  authors;

  @computed('description')
  get safeDescription() {
    return new htmlSafe(this.description);
  }

  set safeDescription(v) {
    return v;
  }

  @computed('splash')
  get splashBackground() {
    return new htmlSafe(
      `background: url(${ENV.APP.API_HOST}/${this.splash.original_image.desktop.url}); background-size: cover;`
    );
  }

  set splashBackground(v) {
    return v;
  }

  @sort('tour_stops', '_positionSort')
  sortedTourStops;

  _positionSort = ['position:asc'];

  @sort('tour_media', '_mediumPositionSort')
  sortedMedia;

  _mediumPositionSort = ['position:asc'];

  @sort('tour_flat_pages', '_flatPagePositionSort')
  sortedFlatPages;

  _flatPagePositionSort = ['position:asc'];
}
