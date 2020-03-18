import classic from 'ember-classic-decorator';
import Model, { hasMany, attr } from '@ember-data/model';

@classic
export default class User extends Model {
  @attr('string')
  display_name;

  @attr('boolean')
  currentTenantAdmin;

  @hasMany('tour-set')
  tour_sets;

  @hasMany('tour')
  tours;

  @attr()
  super;

  @attr()
  login;
}
