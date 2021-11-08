import BaseModalComponent from '../../../../lib/base-modal';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class OtbCrudMediaExtraMediaComponent extends BaseModalComponent {
  @service crudActions;

  @action
  addImage(image) {
    this.crudActions.createHasMany.perform({
      parentObj: this.args.model,
      childObj: image,
      relationType: 'medium'
    });
    // this.modal.hide();
  }
}
