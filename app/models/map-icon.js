import Model, { attr } from '@ember-data/model';

export default class MapIconModel extends Model {
  @attr('string') originalImageUrl;
  @attr('string') filename;
  @attr('string') baseSixtyFour;
}
