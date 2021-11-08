import Public from './public';

export default class TourSet extends Public {
  ajaxOptions(/*defaultOptions, adapter*/) {
    const options = super.ajaxOptions(...arguments);
    options.credentials = 'include';

    return options;
  }
}
