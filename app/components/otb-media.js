import Component from '@ember/component';
import ENV from '../config/environment';


export default class OtbMedia extends Component {
  classBindings = [];
  imageBasePath = ENV.APP.API_HOST;
  ukSlideshow = true;
  animation = 'push';
  loadEmbed = false;
}
