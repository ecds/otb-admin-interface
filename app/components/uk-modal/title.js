import classic from 'ember-classic-decorator';
import { classNames, tagName, layout as templateLayout } from '@ember-decorators/component';
import Component from '@ember/component';
import layout from '../../templates/components/uk-modal/title';

@classic
@templateLayout(layout)
@tagName('h2')
@classNames('uk-modal-title')
export default class Title extends Component {}
