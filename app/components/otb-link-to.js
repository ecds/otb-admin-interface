import LinkComponent from '@ember/routing/link-component';
import { set, get } from '@ember/object';


export default class OtbLinkTo extends LinkComponent {
  dataTheme = 'default';

  didInsertElement() {
    set(this, 'dataTheme', get(this, 'theme.name'));
  }

  deviceorientation/*event*/() {
    // console.log('otb-link-to: ', event);
  }
}
