import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  tour: belongsTo('tour'),
  flat_page: belongsTo('flat-page'),
  position: attr('number')
});
