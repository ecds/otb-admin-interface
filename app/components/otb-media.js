import classic from 'ember-classic-decorator';
import { attributeBindings } from '@ember-decorators/component';
import Component from '@ember/component';
import ENV from '../config/environment';

@classic
@attributeBindings('ukSlideshow:uk-slideshow', 'animation')
export default class OtbMedia extends Component {
  classBindings = [];
  imageBasePath = ENV.APP.API_HOST;
  ukSlideshow = true;
  animation = 'push';
  loadEmbed = false;
}
