import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  tours: hasMany('tour'),
  subdir: attr('string'),
  admins: hasMany('user')
});
