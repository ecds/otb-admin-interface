import Model, { attr } from '@ember-data/model';

export default class Login extends Model {
  @attr('string')
  identification;

  @attr('string')
  password;

  @attr('string')
  password_confirmation;
}
