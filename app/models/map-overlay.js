import Model, { attr, belongsTo } from '@ember-data/model';
import ENV from '../config/environment';

export default class MapOverlayModel extends Model {
  @attr('number', {
    defaultValue() {
      return ENV.defaultSouth;
    }
  }) south;

  @attr('number', {
    defaultValue() {
      return ENV.defaultNorth;
    }
  }) north;

  @attr('number', {
    defaultValue() {
      return ENV.defaultEast;
    }
  }) east;

  @attr('number', {
    defaultValue() {
      return ENV.defaultWest;
    }
  }) west;

  @attr('string') imageUrl;
  @attr('string') filename;
  @attr('string') baseSixtyFour;
  @attr('boolean', { defaultValue: false }) resizing;
  @belongsTo('tour') tour;
  @belongsTo('stop') stop;
}
