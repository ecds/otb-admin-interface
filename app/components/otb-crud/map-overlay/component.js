import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ENV from '../../../config/environment';

export default class OtbCrudMapOverlayComponent extends Component {
  @service fileQueue;
  @service store;

  @tracked
  showInfoWindow = true;

  @tracked
  overlayLoaded = false;

  @tracked
  overlay = this.store.peekRecord('mapOverlay', this.args.model.get('mapOverlay.id'));

  @tracked
  showMap = ENV.environment != 'test';

  @task
  *upload(file) {
    const newOverlay = yield this.args.upload.perform(this.args.model, file, 'mapOverlay');
    yield this.args.addToModel.perform(this.args.model, newOverlay, 'mapOverlay');
  }

  @action
  updateNorthEast(event) {
    // this.showInfoWindow = false;
    // const overlay = this.args.model.get('mapOverlay');
    this.overlay.setProperties({
      north: event.circles.center.lat(),
      east: event.circles.center.lng()
    });
  }

  @action
  updateSouthWest(event) {
    // this.showInfoWindow = false;
    // const overlay = this.args.model.get('mapOverlay');
    this.overlay.setProperties({
      south: event.circles.center.lat(),
      west: event.circles.center.lng()
    });
  }

  @action
  dragStart() {
    this.showInfoWindow = false;
    this.overlay.setProperties({ resizing: true });
  }

  @action
  dragEnd() {
    this.overlay.setProperties({ resizing: false });
    this.args.save.perform(this.overlay);
  }

  // @action
  // updateNorthWest(event) {
  //   // this.showInfoWindow = false;
  //   // const overlay = this.args.model.get('mapOverlay');
  //   this.overlay.setProperties({
  //     north: event.circles.center.lat(),
  //     west: event.circles.center.lng()
  //   });
  // }

  // @action
  // updateSouthEast(event) {
  //   // this.showInfoWindow = false;
  //   // const overlay = this.args.model.get('mapOverlay');
  //   this.overlay.setProperties({
  //     south: event.circles.center.lat(),
  //     east: event.circles.center.lng()
  //   });
  // }

  // @action
  // mapAdded(map, event) {
  //   console.log("🚀 ~ file: component.js ~ line 41 ~ OtbCrudMapOverlayComponent ~ mapAdded ~ map", map)
  //   console.log("🚀 ~ file: component.js ~ line 41 ~ OtbCrudMapOverlayComponent ~ mapAdded ~ event", event)
  // }
}
