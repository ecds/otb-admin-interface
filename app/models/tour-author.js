import Model, { belongsTo } from '@ember-data/model';


export default class TourAuthor extends Model {
  @belongsTo('user') user;
  @belongsTo('tour') tour;
}
