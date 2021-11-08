import { action } from '@ember/object';
import Route from '@ember/routing/route';

export default class NewRoute extends Route {
  model() {
    return this.store.createRecord('tour', { description: '' });
  }

  renderTemplate(controller, model) {
    this.render('admin/tours/edit', {
      model
    });
  }

  @action
  saveTour(model) {
    model.save();
  }
}
