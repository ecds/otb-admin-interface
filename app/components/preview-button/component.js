import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';


export default class PreviewButton extends Component {
  @service tenant;

  get previewUrl() {
    let loc = window.location;
    return `${loc.origin}/${this.tenant.tenant}/${this.args.model.slug}`;
  }

  set previewUrl(v) {
    return v;
  }

  @action
  previewMobile() {
    this.mobilePreviewWindow = window.open(
      this.previewUrl,
      'mobileWindow',
      'width=410, height=730, resizable=no'
    );

    this.args.model.on('didUpdate', () => {
      if (!this.mobilePreviewWindow.closed) {
        this.mobilePreviewWindow.location.reload();
      }
    });
  }

  @action
  previewDesktop() {
    this.desktopPreviewWindow = window.open(
      this.previewUrl,
      'desktopWindow',
      `width=${window.innerWidth}, height=${window.innerHeight}`
    );

    this.args.model.on('didUpdate', () => {
      if (!this.desktopPreviewWindow.closed) {
        this.desktopPreviewWindow.location.reload();
      }
    });
  }
}
