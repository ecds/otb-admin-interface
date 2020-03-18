import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';

@classic
@tagName('')
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
