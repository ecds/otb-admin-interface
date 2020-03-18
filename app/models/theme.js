import classic from 'ember-classic-decorator';
import Model, { attr } from '@ember-data/model';

@classic
export default class Theme extends Model {
  @attr('string')
  title;
}
