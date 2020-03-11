import Model, { attr } from '@ember-data/model';

export default Model.extend({
  identification: attr('string'),
  password: attr('string'),
  password_confirmation: attr('string')
});
