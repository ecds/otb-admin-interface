import classic from 'ember-classic-decorator';
import Model, { hasMany, attr } from '@ember-data/model';

@classic
export default class Mode extends Model {
  @attr('string')
  title;

  @attr('string')
  icon;

  @hasMany('tour')
  tours;
}
