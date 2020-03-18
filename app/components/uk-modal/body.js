import classic from 'ember-classic-decorator';
import { classNames, attributeBindings, layout as templateLayout } from '@ember-decorators/component';
import Component from '@ember/component';
import layout from '../../templates/components/uk-modal/body';

@classic
@templateLayout(layout)
@classNames('uk-modal-body')
@attributeBindings('parent.overflowAuto:uk-overflow-auto')
export default class Body extends Component {}
