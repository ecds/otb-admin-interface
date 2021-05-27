import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, task } from 'ember-concurrency-decorators';
import { timeout, waitForProperty } from 'ember-concurrency';
import { isEmpty } from '@ember/utils';
import { pluralize } from 'ember-inflector';
import UIkit from 'uikit';

export default class CrudActionsService extends Service {
  @service store;
  @service tenant;
  @service taskMessage;

  @tracked
  lastSaved = null;

  // get taskMessage() {
  //   setOwner(ApplicationController);
  //   return getOwner(this).lookup('service:task-manager');
  // }

  @task
  *newRecord(type, attrs) {
    attrs = Object.hasOwnProperty.call(attrs, 'target') ? {} : attrs;
    try {
      let rec = yield this.store.createRecord(type, attrs);
      yield rec.save();
      if (type === 'tour') {
        let routeString = `admin.${pluralize(type)}.edit`;
        return this.transitionToRoute(routeString, this.tenant.tenant, rec);
      }
      return rec;
    } catch (error) {
      //
    }
  }

  @task
  *createHasMany(options) {
    this.taskMessage.message = {
      message: `Adding ${options.relationType}`,
      type: 'success'
    };
    this.taskMessage.screenBlocker.show();
    if (options.parentObj.promise) {
      const parentModel = options.parentObj._belongsToState.modelName;
      options.parentObj = this.store.peekRecord(parentModel, parseInt(options.parentObj.get('id')));
    }
    let attrs = isEmpty(options.attrs) ? {} : options.attrs;
    let childObj = isEmpty(options.childObj)
      ? this.store.createRecord(options.relationType, attrs)
      : options.childObj;
    if (childObj.hasDirtyAttributes) {
      yield this.saveRecord.perform(childObj);
    }
    let relation = yield options.parentObj.get(`${pluralize(options.relationType)}`);
    relation.pushObject(childObj);
    yield this.saveRecord.perform(options.parentObj);
    yield this.taskMessage.screenBlocker.hide();
    return childObj;
  }

  @task
  *deleteHasMany(options) {
    let didConfirm = yield this.confirmDelete.perform(
      options.childObj.get('title')
    );
    let parentObj = Object.hasOwnProperty.call(options.parentObj, 'isFulfilled')
      ? options.parentObj.content
      : options.parentObj;
    let childObj = Object.hasOwnProperty.call(options.childObj, 'isFulfilled')
      ? options.childObj.content
      : options.childObj;
    if (didConfirm ) {
      try {
        parentObj
          .get(`${pluralize(options.relationType)}`)
          .removeObject(childObj);
        if (options.save != false) {
          yield this.saveRecord.perform(parentObj);
        }
      } catch (error) {
        UIkit.notification(`ERROR: ${error}`, { status: 'danger' });
      } finally {
        if (options.reorder) {
          yield timeout(300);
          yield this.reorder.perform(`${options.relationType}List`);
        }
      }
      return true;
    } else {
      parentObj
        .get(`${pluralize(options.relationType)}`)
        .pushObject(childObj);
      childObj.rollbackAttributes();
    }
  }

  @task
  *toggleHasMany(options, event) {
    if (event.target.checked) {
      return yield this.createHasMany.perform(options);
    } else {
      return yield this.deleteHasMany.perform(options);
    }
  }

  @task
  *deleteRecord(obj) {
    let didConfirm = yield this.confirmDelete.perform();
    if (didConfirm) {
      obj.destroyRecord();
    }
  }

  @task
  *confirmDelete(title) {
    try {
      yield UIkit.modal.confirm(`DELETE ${title}`, { status: 'danger' });
      return true;
    } catch (nah) {
      return false;
    }
  }

  @task
  *reorder(event) {
    // Warn if person tries to leave page before everything has been saved.
    // window.onbeforeunload = () => {
    //   return 'Not all updates have finished saving.';
    // };
    // Wait a bit to make sure the DOM is settled.
    yield timeout(500);
    let list = {};
    if (event.constructor === CustomEvent) {
      list = event.target.children;
    } else {
      list = document.getElementById(event).firstElementChild.children;
    }
    this.taskMessage.message = {
      message: `Saving new order 0 of ${list.length}`,
      type: 'success'
    };

    this.taskMessage.screenBlocker.show();
    let index = 1;
    let modelToReorder = '';
    for (let item of list) {
      modelToReorder = item.attributes['data-model'].value;
      let storeItem = this.store.peekRecord(
        modelToReorder,
        item.attributes['data-id'].value
      );
      storeItem.setProperties({
        position: index
      });
      this.taskMessage.message = {
        message: `Saving new order ${index} of ${list.length}`,
        type: 'success'
      };
      index++;
      yield storeItem.save();
    }
    this.taskMessage.message = { message: 'ALL DONE!', type: 'success' };
    yield timeout(300);
    this.taskMessage.screenBlocker.hide();
    window.onbeforeunload = null;
  }

  @dropTask
  *saveRecord(obj) {
    this.lastSaved = null;
    this.tenant.setTenant();
    this.taskMessage.message = {
      message: 'Saving...',
      type: 'success'
    };
    this.taskMessage.screenBlocker.show();
    // yield obj.save();
    // yield timeout(1000);
    obj = Object.hasOwnProperty.call(obj, 'isFulfilled') ? obj.content : obj;
    if (!Object.hasOwnProperty.call(obj, 'store')) {
      return false;
    }
    try {
      yield obj.save();
      this.taskMessage.message = {
        message: `SAVED: ${obj.title}`,
        type: 'success'
      };
      yield timeout(1000);
    } catch (error) {
      this.taskMessage.message = {
        message: `ERROR: ${error}`,
        type: 'danger'
      };
      yield timeout(5000);
    } finally {
      this.taskMessage.screenBlocker.hide();
    }
    const date = new Date;
    this.lastSaved = `Last saved: at ${date.toLocaleTimeString()} on ${date.toLocaleDateString()}`;
    return obj;
  }

  @task
  *uploadFile(parentObj, file) {
    // const reader = new FileReader();
    let encodedFile = yield file.readAsDataURL();
    this.taskMessage.message = {
      message: 'Uploading medium...',
      type: 'success'
    };
    this.taskMessage.screenBlocker.show();
    if (Object.hasOwnProperty.call(parentObj, 'content')) {
      parentObj = parentObj.content;
    }
    try {
      let newImage = yield this.createHasMany.perform({
        relationType: 'medium',
        parentObj: parentObj,
        attrs: {
          original_image: encodedFile,
          title: file.name
        }
      });
      this.taskMessage.message = {
        message: 'Loading new image...',
        type: 'success'
      };
      let savedImage = yield this.store.findRecord('medium', newImage.id);
      yield waitForProperty(savedImage, 'mobile', v => v !== null);
    } catch {
      this.taskMessage.message = {
        message: 'Upload failed :(',
        type: 'danger'
      };
    }

    this.taskMessage.screenBlocker.hide();
  }

  @task
  *setDefaultMod(tour, mode) {
    tour.setProperties({ mode: mode });
    yield this.saveRecord.perform(tour);
  }

  @task
  *setDefaultMode(tour, mode) {
    tour.setProperties({ mode: mode });
    yield tour.save();
  }

  @task
  *rollback(obj) {
    yield obj.rollbackAttributes();
  }
}
