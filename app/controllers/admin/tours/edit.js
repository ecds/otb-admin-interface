import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { copy } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import UIkit from 'uikit';
import { timeout } from 'ember-concurrency';

export default class ToursController extends Controller{
  @service crudActions;
  @service geocoder;
  @service store;
  @service taskMessage;
  @service tenant;

  // @tracked
  // taskMessage = null;

  mapTypes = ['roadmap', 'satellite', 'hybrid', 'terrain'];

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
  *newStop(tour) {
    this.taskMessage.message = {
      message: 'Creating new stop...',
      type: 'success'
    };
    this.taskMessage.screenBlocker.show();
    const stopListElement = document.getElementById('stopList');
    const accordion = UIkit.accordion(stopListElement);
    // Close any open items in the accordion.
    accordion.toggle(-1);
    try {
      this.taskMessage.message = {
        message: 'Adding new stop to tour...',
        type: 'success'
      };
      let newStop = this.store.createRecord('stop', {
        title: `New Stop - ${new Date().getTime().toString()}`
      });
      if (!isEmpty(tour.stops)) {
        let previousStop = [...tour.sortedTourStops].pop();
        newStop.setProperties({
          lat: previousStop.get('stop.lat'),
          lng: previousStop.get('stop.lng')
        });
      }
      this.taskMessage.screenBlocker.hide();
      yield this.crudActions.createHasMany.perform({
        relationType: 'stop',
        parentObj: tour,
        childObj: newStop
      });
      yield this.waitForElement.perform(
        `${newStop.slug}-${newStop.id}`,
        accordion
      );
    } catch (error) {
      this.taskMessage.message = {
        message: `ERROR: ${error.message}`,
        type: 'danger'
      };
    } finally {
      // this.taskMessage = {};
    }
  }

  @task
  *newPage(tour) {
    this.taskMessage.message = {
      message: 'Creating new page...',
      type: 'success'
    };
    const pageListElement = document.getElementById('pageList');
    const accordion = UIkit.accordion(pageListElement);
    // Close any open items in the accordion.
    if (accordion.items.length > 1) {
      accordion.toggle(-1);
    }
    try {
      this.taskMessage = {
        message: 'Adding new page to tour...',
        type: 'success'
      };
      let newPage = yield this.crudActions.createHasMany.perform({
        relationType: 'flatPage',
        parentObj: tour
      });
      newPage.setProperties({
        title: ''
      });
      yield this.waitForElement.perform(`page-${newPage.id}`, accordion);
    } catch (error) {
      this.taskMessage = `ERROR: ${error.message}`;
    }
    // Destroy the modal but leave the element for next time.
  }

  @task
  *addVideo(videoCode, parentObj) {
    this.taskMessage.message = { message: 'Adding video...', type: 'success' };

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
  }

  @task
  *removeStop(tour, stop, tourStop) {
    let didDeleteStop = yield this.crudActions.deleteHasMany.perform({
      parentObj: tour,
      relationType: 'stop',
      childObj: stop
    });

    if (didDeleteStop) {
      let tourStops = yield tour.get('tourStops');
      tourStops.removeObject(tourStop);
      // This shouldn't be needed, but we need to be sure the stop
      // has been removed from the list before updating the order.
      let elToRemove = document.getElementById(`${stop.get('slug')}-${stop.get('id')}`);
      if (elToRemove) {
        elToRemove.remove();
      }
      yield timeout(300);
      yield this.crudActions.reorder.perform('stopList');
    }
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
      // this.get();
    }
  }

  @action
  updateMapType(event) {
    this.model.tour.setProperties({ mapType: event.target.value });
  }

  @task
  *addExistingStop(stop) {
    yield this.crudActions.createHasMany.perform({
      relationType: 'stop',
      parentObj: this.model.tour,
      childObj: stop
    });
      }

  @task
  *copyStop(stop) {
    let stopToCopy = this.store.peekRecord('stop', stop.get('id'));
    let dataCopy = JSON.parse(JSON.stringify(stopToCopy));
    let mediaToCopy = dataCopy.media;
    delete dataCopy.media;
    delete dataCopy.tours;
    let stopCopy = this.store.createRecord('stop', dataCopy);
    let stopMedia = stopCopy.get('media');

    yield mediaToCopy.forEach((mediumId) => {
      const medium = this.store.peekRecord('medium', mediumId);
      stopMedia.pushObject(medium);
    });

    yield this.crudActions.saveRecord.perform(stopCopy);

    yield this.crudActions.createHasMany.perform({
      relationType: 'stop',
      parentObj: this.model.tour,
      childObj: stopCopy
    });
  }

  @task
  *deleteStop(stop) {
    if (!stop.orphaned) return;
    yield this.crudActions.deleteRecord.perform(stop);
  }
}
