import classic from 'ember-classic-decorator';
import { attributeBindings } from '@ember-decorators/component';
import LinkComponent from '@ember/routing/link-component';
import { set, get } from '@ember/object';

@classic
@attributeBindings('dataTheme:data-theme')
export default class OtbLinkTo extends LinkComponent {
  dataTheme = 'default';

  didInsertElement() {
    set(this, 'dataTheme', get(this, 'theme.name'));
  }

  deviceorientation/*event*/() {
    // console.log('otb-link-to: ', event);
  }
}
