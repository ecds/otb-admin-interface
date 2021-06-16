import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OtbCrudMapTypeComponent extends Component {
  mapTypes = ['roadmap', 'satellite', 'hybrid', 'terrain'];

  @tracked
  zIndex = 1;

  @action
  update(event) {
    this.args.model.setProperties({ mapType: event.target.value });
    this.args.save.perform(this.args.model);
  }
}
