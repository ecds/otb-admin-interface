import Model, { belongsTo } from '@ember-data/model';

export default class TourMode extends Model {
  @belongsTo('tour')
  tour;

  @belongsTo('mode')
  mode;
}
