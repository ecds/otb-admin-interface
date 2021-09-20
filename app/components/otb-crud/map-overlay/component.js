import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ENV from '../../../config/environment';

export default class OtbCrudMapOverlayComponent extends Component {
  @service fileQueue;

  @tracked
  showInfoWindow = true;

  @tracked
  overlayLoaded = false;

  @tracked
  showMap = ENV.environment != 'test';

  @tracked
  map = null;

  @tracked
  showHandles = true;

  @task
  *upload(file) {
    const newOverlay = yield this.args.upload.perform(this.args.model, file, 'mapOverlay');
    yield this.args.addToModel.perform(this.args.model, newOverlay, 'mapOverlay');
  }

  @action
  mapLoaded(event) {
    this.map = event.map;
  }

  @action
  updateNorthEast(event) {
    this.args.model.mapOverlay.setProperties({
      north: event.circles.center.lat(),
      east: event.circles.center.lng()
    });
  }

  @action
  updateSouthWest(event) {
    this.args.model.mapOverlay.setProperties({
      south: event.circles.center.lat(),
      west: event.circles.center.lng()
    });
  }

  @action
  updateNorthWest(event) {
    this.args.model.mapOverlay.setProperties({
      north: event.circles.center.lat(),
      west: event.circles.center.lng()
    });
  }

  @action
  updateSouthEast(event) {
    this.args.model.mapOverlay.setProperties({
      south: event.circles.center.lat(),
      east: event.circles.center.lng()
    });
  }

  @action
  dragStart() {
    this.showInfoWindow = false;
    this.args.model.mapOverlay.setProperties({ resizing: true });
  }

  @task
  *dragEnd() {
    this.showHandles = false;
    this.args.model.mapOverlay.setProperties({ resizing: false });
    yield this.args.save.perform(this.args.model.mapOverlay);
    this.showHandles = true;
    this.overlayLoaded = true;
  }
}
