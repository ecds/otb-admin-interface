import Model, { belongsTo, attr } from '@ember-data/model';

export default class StopMedium extends Model {
  @belongsTo('stop')
  stop;

  @belongsTo('medium')
  medium;

  @attr('number')
  position;
}
