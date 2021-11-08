import Model, { hasMany, attr } from '@ember-data/model';

export default class Mode extends Model {
  @attr('string')
  title;

  @attr('string')
  icon;

  @hasMany('tour')
  tours;
}
