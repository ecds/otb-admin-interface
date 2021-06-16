import OverlayView from 'ember-google-maps/components/g-map/overlay';
import { action } from '@ember/object';
/* global google */

export default class GMapImageOverlayComponent extends OverlayView {

  overlayElement = null;
  paneName = 'overlayLayer';

  get position() {
    let { south, west, north, east } = this.args;

    if ([south, west, north, east].some( boundary => boundary == null)) {
      return null;
    }
    return this.toBounds(south, west, north, east);
  }

  toBounds(south, west, north, east) {
    return new google.maps.LatLngBounds(
      new google.maps.LatLng(south, west),
      new google.maps.LatLng(north, east)
    );
  }

  onAdd() {
    this.map.fitBounds(this.position);

    let panes = this.mapComponent.getPanes();
    this.targetPane = panes[this.paneName];

    this.targetPane.appendChild(this.overlayElement);

    this.addEventsToMapComponent(
      this.overlayElement,
      this.events,
      this.publicAPI
    );
  }

  draw() {
    let { position, zIndex } = this;

    let overlayProjection = this.mapComponent.getProjection();
    let sw = overlayProjection.fromLatLngToDivPixel(position.getSouthWest());
    let ne = overlayProjection.fromLatLngToDivPixel(position.getNorthEast());


    this.overlayElement.style.cssText = `
      position: absolute;
      left: ${sw.x}px;
      top: ${ne.y}px;
      height: ${sw.y - ne.y}px;
      width: ${ne.x - sw.x}px;
      z-index: ${zIndex};
    `;

    this.mapComponent.didDraw ||= true;
  }

  @action
  getOverlay(element) {
    this.overlayElement = element;
  }
}
