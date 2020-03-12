import Model, { hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import ENV from '../config/environment';

export default Model.extend({
  tenant: service(),

  title: attr('string'),
  caption: attr('string'),
  video: attr('string'),
  original_image: attr(),
  embed: attr('string'),
  desktop: attr('string'),
  tablet: attr('string'),
  mobile: attr('string'),
  srcset: attr('string'),
  srcset_sizes: attr('string'),
  // stop: attr(),
  tours: hasMany('tour', { async: true }),
  stops: hasMany('stop', { async: true }),

  loadEmbed: attr('boolean', { defaultValue: false }),

  baseUrl: computed('original_image', function() {
    return `${ENV.APP.API_HOST}`;
  }),

  safeEmbed: computed('embed', function() {
    return htmlSafe(this.embed);
  })
});
