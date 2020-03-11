import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  display_name: attr('string'),
  currentTenantAdmin: attr('boolean'),
  tour_sets: hasMany('tour-set'),
  tours: hasMany('tour'),
  super: attr(),
  login: attr()
});
