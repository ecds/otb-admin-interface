import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  tenant: service(),
  tagName: '',

  previewUrl: computed('model', function() {
    let loc = window.location;
    return `${loc.origin}/${this.tenant.tenant}/${this.model.slug}`;
  }),

  actions: {
    previewMobile() {
      this.set(
        'mobilePreviewWindow',
        window.open(
          this.previewUrl,
          'mobileWindow',
          'width=410, height=730, resizable=no'
        )
      );
      this.model.on('didUpdate', () => {
        if (!this.mobilePreviewWindow.closed) {
          this.mobilePreviewWindow.location.reload();
        }
      });
    },

    previewDesktop() {
      this.set(
        'desktopPreviewWindow',
        window.open(this.previewUrl, 'desktopWindow', `width=${window.innerWidth}, height=${window.innerHeight}`)
      );
      this.model.on('didUpdate', () => {
        if (!this.desktopPreviewWindow.closed) {
          this.desktopPreviewWindow.location.reload();
        }
      });
    }
  }
});
