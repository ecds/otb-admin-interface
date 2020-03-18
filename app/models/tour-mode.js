import classic from 'ember-classic-decorator';
import Model, { belongsTo } from '@ember-data/model';

@classic
export default class TourMode extends Model {
  @belongsTo('tour')
  tour_id;

  @belongsTo('mode')
  mode_id;
}
