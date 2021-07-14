import Model, { hasMany, attr } from '@ember-data/model';
import { isEmpty } from '@ember/utils';

export default class User extends Model {
  @attr('string') displayName;
  @attr('string') email;
  @attr('string') provider;
  @attr('boolean') currentTenantAdmin;
  @attr('boolean') super;

  @hasMany('tour-set') tourSets;
  @hasMany('tour') tours;
  @hasMany('tour-author') tourAuthors;

  get tourSetNames() {
  if (this.super) {
    return 'All';
  }
  else if (isEmpty(this.tourSets)) {
      return "none";
    }
    return this.tourSets.map(tourSet => tourSet.name).join(', ');
  }
}
