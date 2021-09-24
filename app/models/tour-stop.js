import Model, { belongsTo, attr } from '@ember-data/model';

export default class TourStop extends Model {
  @belongsTo('tour')
  tour;

  @belongsTo('stop', {
    async: true
  })
  stop;

  @attr('string')
  slug;

  @attr('number', {
    defaultValue: 1
  })
  position;

  @attr()
  next;

  @attr('string')
  next_slug;

  @attr('string')
  previous_slug;

  @attr()
  previous;

  @attr('boolean', {
    defaultValue: false
  })
  active;
}
