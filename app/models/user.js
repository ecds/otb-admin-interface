import Model, { hasMany, attr } from '@ember-data/model';

export default class User extends Model {
  @attr('string') display_name;
  @attr('string') email;
  @attr('string') provider;
  @attr('boolean') currentTenantAdmin;
  @attr('boolean') super;

  @hasMany('tour-set') tour_sets;
  @hasMany('tour') tours;
}
