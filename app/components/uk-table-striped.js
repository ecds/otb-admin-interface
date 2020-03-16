import classic from 'ember-classic-decorator';
import { classNames, tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('table')
@classNames('uk-table', 'uk-table-striped', 'uk-table uk-table-middle')
export default class UkTableStriped extends Component {}
