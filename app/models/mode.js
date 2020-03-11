import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  title: attr('string'),
  icon: attr('string'),
  tours: hasMany('tour')
});
