import Service from '@ember/service';
import { get } from '@ember/object';

export default Service.extend({
  init() {
    this._super(...arguments);
    this.setProperties({
      utterance: null,
      synth: null,
      text: null,
      speaking: false
    });
  },

  read(content) {
    let _utterance = this.utterance;
    _utterance.text = content;
    _utterance.lang = navigator.language;
    this.synth.speak(_utterance);
  },

  resume() {
    this.synth.resume();
  },

  pause() {
    this.synth.pause();
  },

  cancel() {
    this.synth.cancel();
  }
});
