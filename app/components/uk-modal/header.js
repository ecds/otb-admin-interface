import classic from 'ember-classic-decorator';
import { classNames, tagName, layout as templateLayout } from '@ember-decorators/component';
import Component from '@ember/component';
import layout from '../../templates/components/uk-modal/header';

@classic
@templateLayout(layout)
@tagName('header')
@classNames('uk-modal-header')
export default class Header extends Component {}
