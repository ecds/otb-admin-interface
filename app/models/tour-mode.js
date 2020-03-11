import Model, { belongsTo } from '@ember-data/model';

export default Model.extend({
  tour_id: belongsTo('tour'),
  mode_id: belongsTo('mode')
});
