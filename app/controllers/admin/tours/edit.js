import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
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
  *addVideo(videoProps, parentObj) {
    this.taskMessage.message = { message: 'Adding video...', type: 'success' };

    if (Object.hasOwnProperty.call(parentObj, 'content')) {
      parentObj = parentObj.content;
    }
    let options = {
      relationType: 'medium',
      parentObj: parentObj,
      attrs: videoProps
    };
    yield this.crudActions.createHasMany.perform(options);
  }

  @task
  *removeChild(child, tourChild, itemType, skipConfirm=false) {
    let didDeleteChild = yield this.crudActions.deleteHasMany.perform(
      {
        parentObj: this.model.tour,
        relationType: itemType,
        childObj: child
      },
      skipConfirm
    );

    if (didDeleteChild) {
      // let tourStops = yield this.model.tour.get(`${itemType}s`);
      // tourStops.removeObject(tourChild);
      // This shouldn't be needed, but we need to be sure the stop
      // has been removed from the list before updating the order.
      let elToRemove = document.getElementById(`${child.get('slug')}-${child.get('id')}`);
      if (elToRemove) {
        elToRemove.remove();
      }
      yield timeout(300);
      yield this.crudActions.reorder.perform(`${itemType}List`);
    }
  }

  @task
  *makeChildUnique(tourChild, childType) {
    let child = this.store.peekRecord(childType, tourChild.get(`${childType}.id`));
    yield this.removeChild.perform(child, tourChild, childType, true);
    yield this.copyChild.perform(child, childType);
  }

  @task
  *addExistingItem(item, itemType) {
    yield this.crudActions.createHasMany.perform({
      relationType: itemType,
      parentObj: this.model.tour,
      childObj: item
    });
  }

  @task
  *copyChild(child, childType) {
    let childToCopy = this.store.peekRecord(childType, child.get('id'));
    let dataCopy = JSON.parse(JSON.stringify(childToCopy));

    let childCopy = null;

    if (childType == 'stop') {
      let mediaToCopy = dataCopy.media;
      delete dataCopy.media;
      delete dataCopy.tours;
      childCopy = yield this.store.createRecord(childType, dataCopy);
      let stopMedia = childCopy.get('media');

      yield mediaToCopy.forEach((mediumId) => {
        const medium = this.store.peekRecord('medium', mediumId);
        stopMedia.pushObject(medium);
      });
    } else {
      delete dataCopy.tours;
      childCopy = yield this.store.createRecord(childType, dataCopy);
    }

    yield this.crudActions.saveRecord.perform(childCopy);

    yield this.crudActions.createHasMany.perform({
      relationType: childType,
      parentObj: this.model.tour,
      childObj: childCopy
    });
  }

  // @task
  // *copyPage(page) {
  //   let pageToCopy = this.store.peekRecord('flatPage', page.id);
  //   let dataCopy = JSON.parse(JSON.stringify(pageToCopy));
  //   let pageCopy = this.store.createRecord('flatPage', dataCopy);

  //   yield this.crudActions.saveRecord.perform(pageCopy);
  //   yield this.crudActions.createHasMany.perform({
  //     relationType: 'flatPage',
  //     parentObj: this.model.tour,
  //     childObj: pageCopy
  //   });
  // }

  @task
  *deleteItem(item) {
    if (!item.orphaned) return;
    yield this.crudActions.deleteRecord.perform(item);
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
    if (Object.hasOwnProperty.call(model, '_belongsToState')) {
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
}
