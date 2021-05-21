import Component from '@glimmer/component';
import { computed } from '@ember/object';

export default class OtbTooltip extends Component {
  @computed('')
  get ukTooltip() {
    return `title: ${this.tooltipContent}`;
  }

  set ukTooltip(v) {
    return v;
  }

  @computed('')
  get ariaDescribedBy() {
    return `aria-describedby-${this.elementId}`;
  }

  set ariaDescribedBy(v) {
    return v;
  }
}
