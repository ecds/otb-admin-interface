import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import Model, { hasMany, attr } from '@ember-data/model';
import { htmlSafe } from '@ember/string';

@classic
export default class FlatPage extends Model {
  @attr('string')
  title;

  @attr('string')
  slug;

  @attr('string', {
    defaultValue: ''
  })
  content;

  @hasMany('tour', {
    async: true
  })
  tour;

  @hasMany('tour-flat-pages', {
    async: true
  })
  tour_flat_pages;

  @computed('content')
  get safeContent() {
    return new htmlSafe(this.content);
  }
}
