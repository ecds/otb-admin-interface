import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { htmlSafe } from '@ember/string';
import ENV from '../config/environment';

export default class TourModel extends Model {
  @attr('string')
  title;

  @attr('string')
  slug;

  @attr('string', {
    defaultValue: ''
  })
  description;

  @attr('string')
  sanitizedDescription;

  @attr('string')
  metaDescription;

  @attr('string')
  video;

  @attr('number')
  position;

  @attr('number')
  stopCount;

  @attr('string')
  themeTitle;

  @hasMany('tour-mode')
  tourModes;

  @attr()
  splash;

  @attr('string')
  externalUrl;

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
  tenantTitle;

  @attr('boolean')
  published;

  @hasMany('tour-stop', {
    async: true
  })
  tourStops;

  @hasMany('mode')
  modes;

  @hasMany('tour-medium')
  tourMedia;

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
  flatPages;

  @hasMany('tour-flat-page')
  tourFlatPages;

  @attr('string', {
    defaultValue: 'hybrid'
  })
  mapType;

  @hasMany('user')
  authors;

  get safeDescription() {
    return new htmlSafe(this.description);
  }

  set safeDescription(v) {
    return v;
  }

  get splashBackground() {
    return new htmlSafe(
      `background: url(${ENV.APP.API_HOST}/${this.splash.original_image.desktop.url}); background-size: cover;`
    );
  }

  get modeList() {
    return this.modes.map(m => m.get('title'));
  }

  set splashBackground(v) {
    return v;
  }

  get sortedTourStops() {
    return this.tourStops.sortBy('position');
  }

  get sortedMedia() {
    this.stops;
    return this.tourMedia.sortBy('position');
  }

  get sortedFlatPages() {
    return this.tourFlatPages.sortBy('position');
  }
}
