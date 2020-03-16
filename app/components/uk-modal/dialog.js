import classic from 'ember-classic-decorator';
import { layout as templateLayout } from '@ember-decorators/component';
import ModalBase from './modal-base';
import layout from '../../templates/components/uk-modal/dialog';

@classic
@templateLayout(layout)
export default class Dialog extends ModalBase {}
