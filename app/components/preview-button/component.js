import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';


export default class PreviewButton extends Component {
  @service
  tenant;

  @computed('model')
  get previewUrl() {
    let loc = window.location;
    return `${loc.origin}/${this.tenant.tenant}/${this.model.slug}`;
  }

  set previewUrl(v) {
    return v;
  }

  @action
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
  }

  @action
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
