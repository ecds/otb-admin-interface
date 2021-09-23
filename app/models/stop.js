import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { icon as faIcon } from '@fortawesome/fontawesome-svg-core';
/* global google */

export default class Stop extends Model {
  @attr('string') title;
  @attr('string') slug;

  @attr('number', {
    defaultValue: 33.75432
  }) lat;

  @attr('number', {
    defaultValue: -84.38979
  }) lng;

  @attr('number') parkingLat;
  @attr('number') parkingLng;
  @attr('string') address;
  @attr('string') parkingAddress;
  @attr('string') iconColor;

  @attr('string', {
    defaultValue: ''
  }) description;

  @attr('string') metaDescription;
  @attr('string') article_link;
  @attr('string') video_embed;
  @attr('string') video_poster;
  @attr('string') direction_intro;
  @attr('string') directionNotes;
  @attr('boolean') orphaned;
  @hasMany('tour') tours;

  @hasMany('tour-stop', {
    async: true
  }) tourStops;

  @hasMany('stop-medium', {
    async: true
  }) stopMedia;

  @hasMany('medium', {
    async: true
  }) media;

  @belongsTo('mapIcon') mapIcon;

  @attr() splash;

  get isShared() {
    return this.tours.length > 1;
  }

  get sortedMedia() {
    return this.stopMedia.sortBy('position');
  }

  get icon() {
    // if (this.mapIcon.get('originalImageUrl')) {
    //   return this.mapIcon.get('originalImageUrl');
    // }
    const icon = this.imageIcon ? this.imageIcon : this.markerIconSVG;
    if (this.active) {
      icon.scale = .125;
      icon.scaledSize = new google.maps.Size(100, 100);
    }
    return icon;
  }

  get markerIconSVG() {
    return {
      fillColor: this.iconColor,
      fillOpacity: 1,
      scale: 0.075,
      label: 'X',
      labelOrigin: new google.maps.Point(200, 200),
      anchor: new google.maps.Point(200, 600),
      path: faIcon({ prefix: 'fas', iconName: 'map-marker' }).icon.lastObject
    };
  }

  get imageIcon() {
    const url = this.mapIcon.get('originalImageUrl');
    return url ? { url } : null;
  }

  get parkingIconSVG() {
    return {
      path: faIcon({ prefix: 'fas', iconName: 'square' }).icon.lastObject,
      fillColor: 'blue',
      fillOpacity: 1,
      scale: 0.075,
      labelOrigin: new google.maps.Point(250, 250),
      anchor: new google.maps.Point(200, 600)
    };
  }
}
