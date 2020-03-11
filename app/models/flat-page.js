import Model, { hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Model.extend({
  title: attr('string'),
  slug: attr('string'),
  content: attr('string', {
    defaultValue: ''
  }),
  tour: hasMany('tour', {
    async: true
  }),
  tour_flat_pages: hasMany('tour-flat-pages', {
    async: true
  }),
  safeContent: computed('content', function safeContent() {
    return new htmlSafe(this.content);
  })
});
