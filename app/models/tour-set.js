import classic from 'ember-classic-decorator';
import Model, { hasMany, attr } from '@ember-data/model';

@classic
export default class TourSet extends Model {
  @attr('string')
  name;

  @hasMany('tour')
  tours;

  @attr('string')
  subdir;

  @hasMany('user')
  admins;
}
