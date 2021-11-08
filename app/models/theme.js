import Model, { attr } from '@ember-data/model';

export default class Theme extends Model {
  @attr('string')
  title;
}
