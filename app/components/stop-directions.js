import classic from 'ember-classic-decorator';
import { classNames, classNameBindings } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@classNames('uk-panel-scrollable', 'otb-stop-directions-container', 'uk-width-1-1')
@classNameBindings('show')
export default class StopDirections extends Component {
  show = false;

  didInsertElement() {
    this.set('show', true);
  }

  willDestroy() {
    this.set('show', false);
  }
}
