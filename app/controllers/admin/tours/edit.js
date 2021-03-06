import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import CrudActionsMixin from '../../../mixins/crud-actions';
import UIkit from 'uikit';
import ENV from '../../../config/environment';

export default Controller.extend(CrudActionsMixin, {
  store: service(),
  tenant: service(),
  geocoder: service(),
  taskMessage: null,
  env: ENV,

  mapTypes: ['roadmap', 'satellite', 'hybrid', 'terrain'],

  screenBlocker: computed('taskMessage', () => {
    return UIkit.modal(document.getElementById('task-running'), {
      escClose: false,
      bgClose: false
    });
  }),

  waitForElement: task(function*(element, accordion) {
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
  }),

  saveTour: task(function*(tour) {
    yield this.saveRecord.perform(tour);
    tour.stops.forEach(stop => {
      if (stop.hasDirtyAttributes) {
        stop.save();
      }
    });
  }),

  showTaskMessage: task(function*(message) {
    this.set('taskMessage', message);
    return yield this.screenBlocker.show();
  }),

  clearTaskMessage: task(function*() {
    this.set('taskMessage', null);
    return yield this.screenBlocker.hide();
  }),

  newStop: task(function*(tour) {
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
      let newStop = yield this.createHasMany.perform({
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
  }),

  newPage: task(function*(tour) {
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
      let newPage = yield this.createHasMany.perform({
        relationType: 'flat_page',
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
  }),

  addVideo: task(function*(videoCode, parentObj) {
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
    yield this.createHasMany.perform(options);
    modal.hide();
    modal.$destroy;
  }),

  actions: {
    cancelChangesTour(tour) {
      this.send('cancelChanges', tour);
      tour.stops.forEach(stop => {
        this.send('cancelChanges', stop);
      });
    },

    cancelChanges(model) {
      if (model.hasOwnProperty('_belongsToState')) {
        model.then(m => {
          this.send('cancelChanges', m);
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
    },

    doNothing() {
      return true;
    },

    scrollElementToTop(event) {
      let path = event.path || (event.composedPath && event.composedPath());
      path[2].scrollIntoView();
      window.scrollBy(0, -100);
    },

    addRemoveMode(options, event) {
      if (event.target.checked) {
        this.get();
      }
    }
  }
});
