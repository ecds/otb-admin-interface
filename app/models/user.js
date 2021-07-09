import Model, { hasMany, attr } from '@ember-data/model';

export default class User extends Model {
  @attr('string') displayName;
  @attr('string') email;
  @attr('string') provider;
  @attr('boolean') currentTenantAdmin;
  @attr('boolean') super;

  @hasMany('tour-set') tourSets;
  @hasMany('tour') tours;
  @hasMany('tour-author') tourAuthors;
}
