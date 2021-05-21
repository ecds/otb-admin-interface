import Model, { attr } from '@ember-data/model';

export default class TourCollection extends Model {
  @attr('string')
  name;
}
