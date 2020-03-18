import classic from 'ember-classic-decorator';
import Model, { attr } from '@ember-data/model';

@classic
export default class Login extends Model {
  @attr('string')
  identification;

  @attr('string')
  password;

  @attr('string')
  password_confirmation;
}
