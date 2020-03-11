import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  stop: belongsTo('stop'),
  medium: belongsTo('medium'),
  position: attr('number')
});
