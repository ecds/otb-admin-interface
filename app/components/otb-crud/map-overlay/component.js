import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ENV from '../../../config/environment';
import { icon as faIcon } from '@fortawesome/fontawesome-svg-core';
/* global google */

export default class OtbCrudMapOverlayComponent extends Component {
  @service fileQueue;
  @service crudActions;

  @tracked
  showInfoWindow = true;

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

  get handle() {
    return {
      path: faIcon({ prefix: 'fas', iconName: 'circle' }).icon.lastObject,
      fillColor: 'deeppink',
      fillOpacity: 1,
      scale: 0.075,
      anchor: new google.maps.Point(200, 200)
    };
  }

  @action
  mapLoaded(event) {
    this.map = event.map;
  }

  @action
  updateNorthEast(event) {
    this.args.model.mapOverlay.setProperties({
      north: event.markers.position.lat(),
      east: event.markers.position.lng()
    });
  }

  @action
  updateSouthWest(event) {
    this.args.model.mapOverlay.setProperties({
      south: event.markers.position.lat(),
      west: event.markers.position.lng()
    });
  }

  @action
  updateNorthWest(event) {
    this.args.model.mapOverlay.setProperties({
      north: event.markers.position.lat(),
      west: event.markers.position.lng()
    });
  }

  @action
  updateSouthEast(event) {
    this.args.model.mapOverlay.setProperties({
      south: event.markers.position.lat(),
      east: event.markers.position.lng()
    });
  }

  @action
  dragStart() {
    this.showInfoWindow = false;
    this.args.model.mapOverlay.setProperties({ resizing: true });
  }

  @task
  *dragEnd() {
    this.args.model.mapOverlay.setProperties({ resizing: false });
    yield this.args.save.perform(this.args.model.mapOverlay, false);
  }
}
