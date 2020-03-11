import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  tour: belongsTo('tour'),
  medium: belongsTo('medium'),
  position: attr('number')
});
