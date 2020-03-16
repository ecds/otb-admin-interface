import classic from 'ember-classic-decorator';
import Model, { belongsTo, attr } from '@ember-data/model';

@classic
export default class StopMedium extends Model {
  @belongsTo('stop')
  stop;

  @belongsTo('medium')
  medium;

  @attr('number')
  position;
}
