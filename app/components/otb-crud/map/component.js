import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
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

  constructor() {
    super(...arguments);
    this.stop = this.store.peekRecord('stop', this.args.model.get('id'));
    if ((this.stop.lat && !this.stop.address) || (this.stop.parkingLat && !this.parkingAddress)) {
      this.getAddress(!this.stop.address);
    }
  }

  @action
  clearLocator() {
    this.locator = null;
    this.parkingAddress = null;
  }

  getAddress(getStop=true) {
    let stopLatLng = {
        lat: parseFloat(this.stop.lat),
        lng: parseFloat(this.stop.lng)
      },
      parkingLatLng = {
        lat: parseFloat(this.stop.parkingLat),
        lng: parseFloat(this.stop.parkingLng)
      };

    if (stopLatLng && getStop) {
      locator.geocode(
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

    if (this.stop.parkingLat) {
      locator.geocode(
        {
          location: parkingLatLng
        },
        (results, status) => {
          if (status === 'OK') {
            this.parkingAddress = results[0].formatted_address;
          } else {
            //
          }
        }
      );
    }
  }

  get parkingIcon() {
    if (this.stop.parkingLat) {
      return {
        url: '/admin/assets/icons/parking.svg',
        size: new google.maps.Size(90, 90),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(15, 15),
        origin: new google.maps.Point(0, 0)
      };
    }
    return null;
  }

  set parkingIcon(v) {
    return v;
  }

  @task
  *locateAddress(stop=true) {
    if (stop) {
      yield locator.geocode(
        {
          address: this.stop.address
        },
        (result, status) => {
          if (status === 'OK') {
            let location = result[0].geometry.location;
            this.stop.setProperties({
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
              parkingLat: location.lat(),
              parkingLng: location.lng()
            });
          } else {
            // debug(status);
          }
        }
      );
    }
  }

  @action
  reLocate(newLat, newLng) {
    this.stop.setProperties({
      lat: newLat,
      lng: newLng
    });
    this.getAddress();
  }

  @action
  reLocateParking(newLat, newLng) {
    this.stop.setProperties({
      parkingLat: newLat,
      parkingLng: newLng
    });
    this.getAddress();
  }
}
