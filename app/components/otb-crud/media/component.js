import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default class OtbCrudMediaComponent extends Component {
  @service store;

  @action
  imageLoaded(medium) {
    medium.setProperties({ loaded: true });
  }

  @action
  imageError(medium_id) {
    const medium = this.store.peekRecord('medium', medium_id);
    medium.setProperties({
      loaded: true,
      missing: true
    });
  }

  @task
  *reload(medium_id) {
    const medium = this.store.peekRecord('medium', medium_id);
    medium.setProperties({
      reloading: true
    });
    yield timeout(300);
    medium.rollbackAttributes();
  }
}
