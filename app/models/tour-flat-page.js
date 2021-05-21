import Model, { belongsTo, attr } from '@ember-data/model';

export default class TourFlatPage extends Model {
  @belongsTo('tour')
  tour;

  @belongsTo('flat-page')
  flatPage;

  @attr('number')
  position;
}
