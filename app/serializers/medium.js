import ApplicationSerializer from './application';

export default class Medium extends ApplicationSerializer {
  serialize() {
    let payload = super.serialize(...arguments);
    if (payload.data.attributes.original_image) {
      if (payload.data.attributes.original_image.url) {
        delete payload.data.attributes.original_image.tablet.url;
        delete payload.data.attributes.original_image.desktop.url;
        delete payload.data.attributes.original_image.mobile_list_thumb.url;
        delete payload.data.attributes.original_image.url;
        delete payload.data.attributes.desktop;
        delete payload.data.attributes.tablet;
        delete payload.data.attributes.mobile;
        delete payload.data.attributes.srcset;
      }
    }
    return payload;
  }
}
