import { computed /* observer */ } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default class ThemeService extends Service {
  @service
  store;

  tour = null;
  base = 'default';
  theme = 'dark';

  init() {
    super.init(...arguments);
    this.set('themes', this.store.findAll('theme'));
  }

  // the property used as a reference for styles
  @computed('base')
  get name() {
    const base = this.base;
    const theme = this.theme;
    return `${base}-${theme}`;
  }

  set name(v) {
    return v;
  }

  // set the base theme for the application
  setBase(base) {
    this.set('base', isEmpty(base) ? 'default' : base);
  }

  // set theme to use within base theme
  setTheme(theme) {
    this.set('theme', isEmpty(theme) ? 'first' : theme);
  }

  setTour(tour) {
    this.set('tour', tour);
  }
}
