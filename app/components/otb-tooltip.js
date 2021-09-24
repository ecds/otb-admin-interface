import Component from '@glimmer/component';

export default class OtbTooltip extends Component {
  get ukTooltip() {
    return `title: ${this.tooltipContent}`;
  }

  set ukTooltip(v) {
    return v;
  }

  get ariaDescribedBy() {
    return `aria-describedby-${this.elementId}`;
  }

  set ariaDescribedBy(v) {
    return v;
  }
}
