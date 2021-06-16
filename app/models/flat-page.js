import Model, { hasMany, attr } from '@ember-data/model';

export default class FlatPage extends Model {
  @attr('string') title;
  @attr('string') slug;
  @attr('boolean') orphaned;

  @attr('string', {
    defaultValue: ''
  }) body;

  @hasMany('tour', {
    async: true
  }) tour;

  @hasMany('tour-flat-pages', {
    async: true
  }) tourFlatPages;
}
