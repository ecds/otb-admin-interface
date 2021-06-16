import Model, { belongsTo, attr } from '@ember-data/model';

export default class TourMedium extends Model {
  @belongsTo('tour') tour;
  @belongsTo('medium') medium;
  @attr('number') position;
  @attr('boolean', {
    defaultValue() {
      return false;
    }
  }) loaded;
}
