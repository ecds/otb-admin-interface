import Model, { hasMany, attr } from '@ember-data/model';

export default class TourSet extends Model {
  @attr('string') name;
  @attr('string') subdir;
  @attr('string') baseSixtyFour;
  @attr('string') logoTitle;
  @attr('string') logoUrl;
  @attr() logo;
  @hasMany('tour') tours;
  @hasMany('user') admins;
}
