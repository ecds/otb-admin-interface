import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class OtbCrudMediaComponent extends Component {
  @action
  imageLoaded(medium) {
    medium.setProperties({ loaded: true });
  }
}
