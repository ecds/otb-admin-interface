import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import UIkit from 'uikit';

// @classNameBindings(
//   'parent.center:uk-flex-top',
//   'parent.container:uk-modal-container',
//   'parent.full:uk-moldal-full'
// )

//   'parent.modalName:id',
//   'parent.escClose:esc-close',
//   'parent.bgClose:bg-close',
//   'parent.stack:stack',
//   'parent.container:container',
//   'parent.clsPage:cls-page',
//   'parent.clsPanel:cls-panel',
//   'parent.selClose:sel-close'
// )
export default class ModalBase extends Component {
  ukModal = '';

  @computed('parent.modalName')
  get modalName() {
    return get(this, 'parent.modalName');
  }

  set modalName(v) {
    return v;
  }

  setEvents() {
    let events = get(this, 'parent').collectEvents();
    for (let event in events) {
      UIkit.util.on(this.element, event, events[event]);
    }
  }

  didInsertElement() {
    super.didInsertElement(...arguments);
    set(this, 'ukModal', UIkit.modal(this.element));
    this.setEvents();
  }
}
