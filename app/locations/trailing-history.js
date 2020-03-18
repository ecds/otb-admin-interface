import classic from 'ember-classic-decorator';
import HistoryLocation from '@ember/routing/history-location';

@classic
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
