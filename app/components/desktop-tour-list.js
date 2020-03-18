import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import 'intersection-observer';

@classic
@classNames('desktop-tour-list', 'uk-overflow-hidden')
export default class DesktopTourList extends Component {
  lastOffset = 0;
  currentStop = null;
}
