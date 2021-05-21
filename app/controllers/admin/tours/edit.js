import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import UIkit from 'uikit';

export default class ToursController extends Controller{
  @service crudActions;
  @service geocoder;
  @service store;
  @service taskMessage;
  @service tenant;

  // @tracked
  // taskMessage = null;

  mapTypes = ['roadmap', 'satellite', 'hybrid', 'terrain'];

  get screenBlocker() {
    return UIkit.modal(document.getElementById('task-running'), {
      message: this.taskMessage,
      escClose: false,
      bgClose: false
    });
  }

  @task
  *waitForElement(element, accordion) {
    // TODO: Use Ember Concurrency `waitForProperty`
    let checkExist = yield setInterval(() => {
      if (document.getElementById(element)) {
        clearInterval(checkExist);
        let child = document.getElementById(element);
        let parent = child.parentNode;
        accordion.toggle(Array.prototype.indexOf.call(parent.children, child));
      }
    }, 300);
    return checkExist;
  }

  @task
  *saveTour(tour) {
    yield this.crudActions.saveRecord.perform(tour);
    tour.stops.forEach(stop => {
      if (stop.hasDirtyAttributes) {
        stop.save();
      }
    });
  }

  @task
  *showTaskMessage(message) {
    this.set('taskMessage', message);
    return yield this.screenBlocker.show();
  }

  @task
  *clearTaskMessage() {
    this.set('taskMessage', null);
    return yield this.screenBlocker.hide();
  }

  @task
  *newStop(tour) {
    yield this.showTaskMessage.perform({
      message: 'Creating new stop...',
      type: 'success'
    });
    const stopListElement = document.getElementById('stopList');
    const accordion = UIkit.accordion(stopListElement);
    // Close any open items in the accordion.
    accordion.toggle(-1);
    try {
      this.set('taskMessage', {
        message: 'Adding new stop to tour...',
        type: 'success'
      });
      let newStop = yield this.crudActions.createHasMany.perform({
        relationType: 'stop',
        parentObj: tour,
        childObj: this.store.createRecord('stop', {})
      });
      newStop.setProperties({
        title: new Date().getTime().toString()
      });
      yield this.clearTaskMessage.perform();
      yield this.waitForElement.perform(
        `${newStop.slug}-${newStop.id}`,
        accordion
      );
    } catch (error) {
      this.set('taskMessage', `ERROR: ${error.message}`);
    }
    // Destroy the modal but leave the element for next time.
    this.screenBlocker.$destroy;
  }

  @task
  *newPage(tour) {
    yield this.showTaskMessage.perform({
      message: 'Creating new page...',
      type: 'success'
    });
    const pageListElement = document.getElementById('pageList');
    const accordion = UIkit.accordion(pageListElement);
    // Close any open items in the accordion.
    if (accordion.items.length > 1) {
      accordion.toggle(-1);
    }
    try {
      this.set('taskMessage', {
        message: 'Adding new page to tour...',
        type: 'success'
      });
      let newPage = yield this.crudActions.createHasMany.perform({
        relationType: 'flatPage',
        parentObj: tour
      });
      newPage.setProperties({
        title: ''
      });
      yield this.clearTaskMessage.perform();
      yield this.waitForElement.perform(`page-${newPage.id}`, accordion);
    } catch (error) {
      this.set('taskMessage', `ERROR: ${error.message}`);
    }
    // Destroy the modal but leave the element for next time.
    this.screenBlocker.$destroy;
  }

  @task
  *addVideo(videoCode, parentObj) {
    this.set('taskMessage', { message: 'Adding video...', type: 'success' });
    const modal = this.screenBlocker;
    modal.show();
    if (parentObj.hasOwnProperty('content')) {
      parentObj = parentObj.content;
    }
    let options = {
      relationType: 'medium',
      parentObj: parentObj,
      attrs: {
        video: videoCode
      }
    };
    yield this.crudActions.createHasMany.perform(options);
    modal.hide();
    modal.$destroy;
  }

  @action
  cancelChangesTour(tour) {
    this.cancelChanges(tour);
    tour.stops.forEach(stop => {
      this.cancelChanges(stop);
    });
  }

  @action
  cancelChanges(model) {
    if (model.hasOwnProperty('_belongsToState')) {
      model.then(m => {
        this.cancelChanges(m);
      });
    }
    if (!model.get('hasDirtyAttributes')) return;
    let changes = null;
    if (typeof model.changedAttributes == 'function') {
      changes = model.changedAttributes();
    } else {
      changes = model.changedAttributes;
    }
    for (const changed in changes) {
      if (
        model.editors &&
        model.editors[changed] &&
        model.changedAttributes()[changed]
      ) {
        const oldValue = changes[changed][0];
        model.editors[changed].setEditorValue(oldValue);
      }
      model.rollbackAttributes();
    }
  }

  @action
  doNothing() {
    return true;
  }

  @action
  scrollElementToTop(event) {
    let path = event.path || (event.composedPath && event.composedPath());
    path[2].scrollIntoView();
    window.scrollBy(0, -100);
  }

  @action
  addRemoveMode(options, event) {
    if (event.target.checked) {
      this.get();
    }
  }
}
