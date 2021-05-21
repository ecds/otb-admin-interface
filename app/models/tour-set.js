import Model, { hasMany, attr } from '@ember-data/model';

export default class TourSet extends Model {
  @attr('string')
  name;

  @hasMany('tour')
  tours;

  @attr('string')
  subdir;

  @hasMany('user')
  admins;
}
