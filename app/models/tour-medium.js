import classic from 'ember-classic-decorator';
import Model, { belongsTo, attr } from '@ember-data/model';

@classic
export default class TourMedium extends Model {
  @belongsTo('tour')
  tour;

  @belongsTo('medium')
  medium;

  @attr('number')
  position;
}
