import Model, { belongsTo, attr } from '@ember-data/model';
import { get, computed } from '@ember/object';

export default class TourStop extends Model {
  @belongsTo('tour')
  tour;

  @belongsTo('stop', {
    async: true
  })
  stop;

  @attr('string')
  slug;

  @attr('number', {
    defaultValue: 1
  })
  position;

  @attr()
  next;

  @attr('string')
  next_slug;

  @attr('string')
  previous_slug;

  @attr()
  previous;

  @attr('boolean', {
    defaultValue: false
  })
  active;

  @computed('position', 'inView')
  get labelContent() {
    if (get(this, 'inView')) {
      return '!';
    } else {
      return get(this, 'position').toString();
    }
  }

  set labelContent(v) {
    return v;
  }

  @computed('color')
  get icon() {
    return {
      scaledSize: new google.maps.Size(35, 35),
      anchor: new google.maps.Point(20, 40),
      origin: new google.maps.Point(0, 0),
      labelOrigin: new google.maps.Point(18, 14),
      url: '/assets/icons/map-marker.svg'
    };
  }

  set icon(v) {
    return v;
  }

  @computed('color')
  get activeIcon() {
    return {
      scaledSize: new google.maps.Size(75, 75),
      labelOrigin: new google.maps.Point(36, 28),
      url: '/assets/icons/map-marker.svg'
    };
  }

  set activeIcon(v) {
    return v;
  }

  @computed('active')
  get label() {
    return {
      color: 'white',
      text: get(this, 'labelContent')
    };
  }

  set label(v) {
    return v;
  }

  @computed('active')
  get activeLabel() {
    let label = get(this, 'label');
    label.fontSize = '2.75em';
    // label.color = 'deeppink';
    return label;
  }

  set activeLabel(v) {
    return v;
  }
}
