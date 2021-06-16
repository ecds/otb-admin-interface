import Model, { attr } from '@ember-data/model';

export default class MapIconModel extends Model {
  @attr('string') imageUrl;
  @attr('string') title;
  @attr('string') baseSixtyFour;
}
