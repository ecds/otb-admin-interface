import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask, restartableTask, task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
/* global google */

const locator = new google.maps.Geocoder();

export default class MapComponent extends Component {
  @service store;

  @tracked
  map = null;

  @tracked
  stop = null;

  @tracked
  stopAddress = null;

  @tracked
  parkingAddress = null;

  @tracked
  showMap = true;

  @tracked
  showInfoWindow = true;

  @tracked
  zoomLevel = 16;

  @tracked
  bounds = null;

  constructor() {
    super(...arguments);
    this.stop = this.store.peekRecord('stop', this.args.model.get('id'));
    if ((this.stop.lat && !this.stop.address) || (this.stop.parkingLat && !this.parkingAddress)) {
      this.getAddress.perform(!this.stop.address);
      this.stop.save();
    }
  }

  @action
  mapLoaded(event) {
    this.map = event.map;
    this.bounds = this.map.getBounds();
    if (this.stop.hasParking) {
      this.__includeParking();
    }
  }

  @action
  updateZoomLevel(event) {
    // This prevents the map from zooming when the marker is dragged.
    this.zoomLevel = event.map.getZoom();
  }

  @action
  clearLocator() {
    this.locator = null;
    this.parkingAddress = null;
  }

  @task
  *getAddress(getStop=true) {
    let stopLatLng = {
        lat: parseFloat(this.stop.lat),
        lng: parseFloat(this.stop.lng)
      },
      parkingLatLng = {
        lat: parseFloat(this.stop.parkingLat),
        lng: parseFloat(this.stop.parkingLng)
      };

    if (getStop) {
      if (stopLatLng) {
        yield locator.geocode(
          {
            location: stopLatLng
          },
          (results, status) => {
            if (status === 'OK') {
              this.stop.setProperties({
                address: results[0].formatted_address
              });
            } else {
              // console.log('nope')
            }
          }
        );
      }
    } else {
      if (this.stop.parkingLat) {
        yield locator.geocode(
          {
            location: parkingLatLng
          },
          (results, status) => {
            if (status === 'OK') {
              this.stop.setProperties({
                parkingAddress: results[0].formatted_address
              });
            } else {
              //
            }
          }
        );
      }
    }

  }

  @restartableTask
  *updateLocation(event) {
    this.showInfoWindow = false;
    yield this.stop.setProperties({
      lat: event.markers.position.lat(),
      lng: event.markers.position.lng()
    });
  }

  @restartableTask
  *updateParkingLocation(event) {
    this.showInfoWindow = false;
    yield this.stop.setProperties({
      parkingLat: event.markers.position.lat(),
      parkingLng: event.markers.position.lng()
    });
  }

  @task
  *updateAddress() {
    this.showMap = false;
    yield this.getAddress.perform();
    this.showMap = true;
  }

  @task
  *locateAddress(stop=true) {
    this.showMap = false;
    if (stop) {
      yield locator.geocode(
        {
          address: this.stop.address
        },
        (result, status) => {
          if (status === 'OK') {
            let location = result[0].geometry.location;
            this.args.model.setProperties({
              address: result[0].formatted_address,
              lat: location.lat(),
              lng: location.lng()
            });
          } else {
            // debug(status);
          }
        }
      );
    } else {
      locator.geocode(
        {
          address: this.stop.parkingAddress
        },
        (result, status) => {
          if (status === 'OK') {
            let location = result[0].geometry.location;
            this.stop.setProperties({
              parkingAddress: result[0].formatted_address,
              parkingLat: location.lat(),
              parkingLng: location.lng()
            });
          } else {
            // debug(status);
          }
        }
      );
    }
    this.showMap = true;
  }

  @task
  *relocate() {
    yield this.getAddress.perform();
    yield this.args.save.perform(this.stop, false);
  }

  @keepLatestTask
  *reLocateParking() {
    yield this.getAddress.perform(false);
    yield this.args.save.perform(this.stop, false);
  }

  __includeParking() {
    /* eslint-disable ember/require-tagless-components */
    // Using the word `extend` seems to trigger the `ember/require-tagless-components` lint warning.
    this.bounds = this.bounds.extend({ lat: this.stop.parkingLat, lng: this.stop.parkingLat });
    /* eslint-enable ember/require-tagless-components */
  }
}
