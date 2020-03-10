import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  theme: service(),

  actions: {
    setTheme(theme) {
      this.model.setProperties({ theme: theme });
      this.save.perform(this.model);
    }
  }
});
