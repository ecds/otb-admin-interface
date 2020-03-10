import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: 'span',

  ukTooltip: computed('', function() {
    return `title: ${this.tooltipContent}`;
  }),

  ariaDescribedBy: computed('', function() {
    return `aria-describedby-${this.elementId}`;
  })
});
