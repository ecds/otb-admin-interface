import Component from '@ember/component';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: 'span',
  reader: service(),
  speaking: false,
  supported: false,
  speechEnded: null,

  didInsertElement() {
    if ('speechSynthesis' in window) {
      let utterance = new SpeechSynthesisUtterance(this.content);
      utterance.onend = () => {
        set(this, 'speaking', false);
      };

      set(this, 'supported', true);
      let readerService = this.reader;
      readerService.setProperties({
        synth: window.speechSynthesis,
        utterance
      });

      readerService.cancel();
    }
  },

  click() {
    this.send('sayIt');
  },

  willDestroy() {
    const reader = this.reader;
    if (get(reader, 'synth') !== null) {
      reader.cancel();
      reader.resume();
    }
  },

  actions: {
    sayIt() {
      const content = this.content;
      let reader = this.reader;
      // set(reader, 'voice', window.speechSynthesis.getVoices()[32]);
      if (!reader.synth.speaking) {
        set(this, 'speaking', true);
        reader.cancel();
        reader.read(content);
      } else if (reader.synth.paused) {
        set(this, 'speaking', true);
        reader.resume();
      } else if (reader.synth.speaking) {
        set(this, 'speaking', false);
        reader.pause();
      }
    }
  }
});
