import Model, { hasMany, attr } from '@ember-data/model';

export default class User extends Model {
  @attr('string')
  display_name;

  @attr('boolean')
  currentTenantAdmin;

  @hasMany('tour-set')
  tour_sets;

  @hasMany('tour')
  tours;

  @attr()
  super;

  @attr()
  login;
}
