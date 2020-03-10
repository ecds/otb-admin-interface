import Component from '@ember/component';

export default Component.extend({
  actions: {
    upload(mod, file) {
      this.uploadTask.perform(mod, file);
    }
  }
});
