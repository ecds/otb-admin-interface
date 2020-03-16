import classic from 'ember-classic-decorator';
import { attributeBindings, tagName } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@tagName('img')
@attributeBindings(
  'alt',
  'dataSrc:data-src',
  'dataSrcset:data-srcset',
  'sizes',
  'target',
  'ukImage:uk-img',
  'ukToggle:uk-toggle',
  'target',
  'dataWidth:data-width',
  'dataHeight:data-height'
)
export default class UkImg extends Component {
  ukImage = true;
  sizes = '(max-width: 620px) 680px, (max-width: 880px) 880px, 1000px';

  // ukToggle: true,

  // This prevents the a click firing after swipes.
  // Without this, the modal appears after person swipes
  // to next image.
  touchEnd(event) {
    event.stopPropagation();
  }
}
