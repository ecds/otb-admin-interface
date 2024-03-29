import HistoryLocation from '@ember/routing/history-location';

export default class TrailingHistory extends HistoryLocation {
  formatURL() {
    let url = super.formatURL(...arguments);
    if (url.includes('#')) {
      return url.replace(/([^/])#(.*)/, '$1/#$2');
    } else {
      return url.replace(/\/?$/, '/');
    }
  }
}
