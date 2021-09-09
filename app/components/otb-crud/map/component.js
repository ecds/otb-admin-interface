import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask, task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { icon as faIcon } from '@fortawesome/fontawesome-svg-core';
/* global google */

const locator = new google.maps.Geocoder();

export default class Map extends Component {
  @service store;

  @tracked
  stop = null;

  @tracked
  stopAddress = null;

  @tracked
  parkingAddress = null;

  @tracked
  showMap = true;

  get parkingIconSVG() {
    return {
      path: faIcon({ prefix: 'fas', iconName: 'map-marker' }).icon.lastObject,
      fillColor: 'blue',
      fillOpacity: 1,
      scale: 0.075,
      anchor: new google.maps.Point(200, 550),
      labelOrigin: new google.maps.Point(200, 200)
    };
  }

  get markerIconSVG() {
    return {
      path: faIcon({ prefix: 'fas', iconName: 'map-marker' }).icon.lastObject,
      fillColor: this.stop.iconColor,
      fillOpacity: 1,
      scale: 0.075,
      anchor: new google.maps.Point(200, 550),
      labelOrigin: new google.maps.Point(200, 200)
    };
  }

  constructor() {
    super(...arguments);
    this.stop = this.store.peekRecord('stop', this.args.model.get('id'));
    if ((this.stop.lat && !this.stop.address) || (this.stop.parkingLat && !this.parkingAddress)) {
      this.getAddress.perform(!this.stop.address);
    }
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

  // get parkingIcon() {
  //   if (this.stop.parkingLat) {
  //     return {
  //       url: '/admin/assets/icons/parking.svg',
  //       size: new google.maps.Size(90, 90),
  //       scaledSize: new google.maps.Size(40, 40),
  //       anchor: new google.maps.Point(15, 15),
  //       origin: new google.maps.Point(0, 0)
  //     };
  //   }
  //   return null;
  // }

  // set parkingIcon(v) {
  //   return v;
  // }

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
              lat: location.lat().toFixed(6),
              lng: location.lng().toFixed(6)
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
              parkingLat: location.lat().toFixed(6),
              parkingLng: location.lng().toFixed(6)
            });
          } else {
            // debug(status);
          }
        }
      );
    }
    this.showMap = true;
  }

  @keepLatestTask
  *updateLocation(event) {
    this.stop.setProperties({
      lat: event.markers.position.lat().toFixed(6),
      lng: event.markers.position.lng().toFixed(6)
    });
    yield timeout(10);
  }

  @action
  relocate(event) {
    this.getAddress.perform();
    this.args.save.perform(this.stop, false);
  }

  @keepLatestTask
  *reLocateParking(event) {
    const newLat = event.markers.position.lat().toFixed(6);
    const newLng = event.markers.position.lng().toFixed(6);
    this.stop.setProperties({
      parkingLat: newLat,
      parkingLng: newLng
    });
    yield this.getAddress.perform(false);
    yield this.args.save.perform(this.stop, false);
  }
}
