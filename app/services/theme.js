import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';

export default class ThemeService extends Service {
  @service
  store;

  @tracked
  tour = null;

  @tracked
  base = 'default';

  @tracked
  theme = 'dark';

  constructor() {
    super(...arguments);
    this.themes = this.store.findAll('theme');
  }

  // the property used as a reference for styles
  get name() {
    // const base = this.base;
    // const theme = this.theme;
    return `${this.base}-${this.theme}`;
  }

  set name(v) {
    return v;
  }

  // set the base theme for the application
  setBase(base) {
    this.base = isEmpty(base) ? 'default' : base;
  }

  // set theme to use within base theme
  setTheme(theme) {
    this.theme = isEmpty(theme) ? 'first' : theme;
  }

  setTour(tour) {
    this.tour = tour;
  }
}
