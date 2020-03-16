import classic from 'ember-classic-decorator';
import { classNames, tagName, layout as templateLayout } from '@ember-decorators/component';
import Component from '@ember/component';
import layout from '../../templates/components/uk-modal/footer';

@classic
@templateLayout(layout)
@tagName('footer')
@classNames('uk-modal-footer')
export default class Footer extends Component {}
