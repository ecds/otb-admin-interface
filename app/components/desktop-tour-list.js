import Component from '@ember/component';
import 'intersection-observer';

export default Component.extend({
  classNames: ['desktop-tour-list', 'uk-overflow-hidden'],
  lastOffset: 0,
  currentStop: null
});
