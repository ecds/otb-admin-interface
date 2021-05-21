import Component from '@ember/component';


export default class OtbEmbed extends Component {
  loadEmbed = false;

  willDestroy() {
    this.setProperties({ loadEmbed: false });
  }
}
