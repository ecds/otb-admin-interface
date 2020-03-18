import classic from 'ember-classic-decorator';
import Model, { belongsTo, attr } from '@ember-data/model';

@classic
export default class TourFlatPage extends Model {
  @belongsTo('tour')
  tour;

  @belongsTo('flat-page')
  flat_page;

  @attr('number')
  position;
}
