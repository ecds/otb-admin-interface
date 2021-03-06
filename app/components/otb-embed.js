import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('')
export default class OtbEmbed extends Component {
  loadEmbed = false;

  willDestroy() {
    this.setProperties({ loadEmbed: false });
  }
}
