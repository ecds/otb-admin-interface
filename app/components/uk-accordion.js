import classic from 'ember-classic-decorator';
import { attributeBindings, tagName } from '@ember-decorators/component';
import Component from '@ember/component';
import UIkit from 'uikit';

// empty function as default event handler
const noop = () => {};

@classic
@tagName('ul')
@attributeBindings(
  'ukAccordion:uk-accordion',
  'active',
  'animation',
  'collapsible',
  'content',
  'duration',
  'multiple',
  'targets',
  'toggle',
  'transition'
)
export default class UkAccordion extends Component {
  ukAccordion = true;
  active = false;
  animation = true;
  collapsible = true;
  content = '> .uk-accordion-content';
  duration = 200;
  multiple = false;
  targets = '> *';
  toggle = '> .uk-accordion-title';
  transition = 'ease';

  setEvents() {
    let events = {
      beforeshow: this.getWithDefault('on-beforeshow', noop),
      show: this.getWithDefault('on-show', noop),
      shown: this.getWithDefault('on-shown', noop),
      beforehide: this.getWithDefault('on-beforehide', noop),
      hide: this.getWithDefault('on-hide', noop),
      hidden: this.getWithDefault('on-hidden', noop)
    };

    for (let event in events) {
      UIkit.util.on(this.element, event, events[event]);
    }
  }

  didInsertElement() {
    super.didInsertElement(...arguments);
    this.setEvents();
  }
}
