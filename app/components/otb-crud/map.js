import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';
import { get, set, action, computed } from '@ember/object';
import { debug } from '@ember/debug';
/* global google */

const locator = new google.maps.Geocoder();

@classic
@tagName('')
export default class Map extends Component {
  stopAddress = null;
  parkingAddress = null;

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    if (get(this, 'model.lat') && !get(this, 'model.address')) {
      this.getAddress();
    }
  }

  willDestroyElement() {
    set(this, 'locator', null);
    // set(this, 'stopAddress', null);
    set(this, 'parkingAddress', null);
  }

  getAddress() {
    let stopLatLng = {
        lat: parseFloat(get(this, 'model.lat')),
        lng: parseFloat(get(this, 'model.lng'))
      },
      parkingLatLng = {
        lat: parseFloat(get(this, 'model.parking_lat')),
        lng: parseFloat(get(this, 'model.parking_lng'))
      };

    if (stopLatLng) {
      locator.geocode(
        {
          location: stopLatLng
        },
        (results, status) => {
          if (status === 'OK') {
            this.model.setProperties({
              address: results[0].formatted_address
            });
          } else {
            debug(status);
          }
        }
      );
    }

    if (get(this, 'model.parking_lat')) {
      locator.geocode(
        {
          location: parkingLatLng
        },
        (results, status) => {
          if (status === 'OK') {
            set(this, 'parkingAddress', results[0].formatted_address);
          } else {
            debug(status);
          }
        }
      );
    }
  }

  @computed('this.model.parking_lat')
  get parkingIcon() {
    return {
      url: '/admin/assets/icons/parking.svg',
      size: new google.maps.Size(90, 90),
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(15, 15),
      origin: new google.maps.Point(0, 0)
    };
  }

  set parkingIcon(v) {
    return v;
  }

  @action
  locateAddress() {
    if (this.get('model.address')) {
      locator.geocode(
        {
          address: this.get('model.address')
        },
        (result, status) => {
          if (status === 'OK') {
            let location = result[0].geometry.location;
            // console.log(location);
            this.model.setProperties({
              lat: location.lat(),
              lng: location.lng()
            });
          } else {
            debug(status);
          }
        }
      );
    }

    if (this.parkingAddress) {
      locator.geocode(
        {
          address: this.parkingAddress
        },
        (result, status) => {
          if (status === 'OK') {
            let location = result[0].geometry.location;
            this.model.setProperties({
              parking_lat: location.lat(),
              parking_lng: location.lng()
            });
          } else {
            debug(status);
          }
        }
      );
    }
  }

  @action
  reLocate(newLat, newLng) {
    this.model.setProperties({
      lat: newLat,
      lng: newLng
    });
    this.getAddress();
  }

  @action
  reLocateParking(newLat, newLng) {
    this.model.setProperties({
      parking_lat: newLat,
      parking_lng: newLng
    });
    this.getAddress();
  }
}
