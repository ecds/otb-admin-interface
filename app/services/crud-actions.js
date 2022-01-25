import Service, { inject as service } from '@ember/service';
import ENV from '../config/environment';
import { tracked } from '@glimmer/tracking';
import { enqueueTask, task, timeout } from 'ember-concurrency';
import { isEmpty } from '@ember/utils';
import { pluralize } from 'ember-inflector';
import { dasherize, camelize } from '@ember/string';
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
      let errors = [];
      error.errors.forEach((message) => {
        errors.push(message.detail);
      });
      this.taskMessage.message = {
        message: `ERROR: ${errors.join(', ')}`,
        type: 'danger'
      };
      this.taskMessage.screenBlocker.show();
      yield timeout(5000);
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
      // const parentModel = options.parentObj.belongsToState(`${pluralize(options.relationType)}`.meta());
      options.parentObj = this.store.peekRecord(parentModel, parseInt(options.parentObj.get('id')));
    }
    let attrs = isEmpty(options.attrs) ? {} : options.attrs;
    let childObj = isEmpty(options.childObj)
      ? this.store.createRecord(dasherize(options.relationType).toLocaleLowerCase(), attrs)
      : options.childObj;
    if (childObj.hasDirtyAttributes) {
      yield this.saveRecord.perform(childObj);
    }
    let relation = yield options.parentObj.get(`${camelize(pluralize(options.relationType))}`);
    relation.pushObject(childObj);
    yield this.saveRecord.perform(options.parentObj);
    yield this.taskMessage.screenBlocker.hide();
    return childObj;
  }

  @task
  *deleteHasMany(options, skipConfirm=true) {
    let didConfirm = skipConfirm;
    if (!skipConfirm) {
      didConfirm = yield this.confirmDelete.perform(
        options.childObj.get('title')
      );
    }
    let parentObj = Object.hasOwnProperty.call(options.parentObj, 'isFulfilled')
      ? options.parentObj.content
      : options.parentObj;
    let childObj = Object.hasOwnProperty.call(options.childObj, 'isFulfilled')
      ? options.childObj.content
      : options.childObj;
    if (skipConfirm || didConfirm ) {
      try {
        parentObj
          .get(`${camelize(pluralize(options.relationType))}`)
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
    if ('checked' in options) {
      if (options.checked) {
        return yield this.deleteHasMany.perform(options);
      } else {
        return yield this.createHasMany.perform(options);
      }
    }
    else if (event && event.target.checked) {
      return yield this.createHasMany.perform(options);
    } else {
      return yield this.deleteHasMany.perform(options);
    }
  }

  @task
  *createHasManyThrough(options, model) {
    const [model1, model2, existing] = Object.keys(options);
    if (existing) {
      const models = yield this.store.findAll(dasherize(model));
      const itemsToDelete = models.filter(item => item.get(`${model1}.id`) == options[model1].id && item.get(`${model2}.id`) == options[model2].id);
      yield itemsToDelete.forEach(item =>this.deleteRecord.perform(item));
    } else {
      const hmt = this.store.createRecord(
        model,
        {
          [model1]: options[model1],
          [model2]: options[model2]
        }
      );
      yield this.saveRecord.perform(hmt);
    }
  }

  @task
  *deleteRecord(obj) {
    if (obj.promise) {
      obj = this.store.peekRecord(obj._belongsToState.modelName, parseInt(obj.get('id')));
    }
    let didConfirm = yield this.confirmDelete.perform(obj.title);
    if (didConfirm) {
      obj.destroyRecord();
      return true;
    }
    return false;
  }

  @task
  *confirmDelete(title) {
    if (ENV.environment == 'test') return true;
    try {
      yield UIkit.modal.confirm(`DELETE ${title}`, { status: 'danger', stacked: true });
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
    if (event.constructor === CustomEvent || ENV.environment == 'test') {
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

  @enqueueTask
  *saveRecord(obj, showBlocker=true) {
    if (showBlocker) {
      this.taskMessage.screenBlocker.show();
    }
    this.lastSaved = null;
    this.tenant.setTenant();
    this.taskMessage.message = {
      message: 'Saving...',
      type: 'success'
    };
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
      yield timeout(500);
    } catch (error) {
      this.taskMessage.message = {
        message: `ERROR: ${obj.errors.messages.join(', ')}`,
        type: 'danger'
      };
      this.taskMessage.screenBlocker.show();
      yield timeout(5000);
    } finally {
      this.taskMessage.screenBlocker.hide();
    }
    const date = new Date;
    this.lastSaved = `Last saved: at ${date.toLocaleTimeString()} on ${date.toLocaleDateString()}`;
    return obj;
  }

  @task
  *uploadFile(parentObj, file, recordType='medium', many=true, titleKey='title', makeNew=true) {
    let encodedFile = yield file.readAsDataURL();
    this.taskMessage.message = {
      message: `Uploading ${file.name}...`,
      type: 'success'
    };
    this.taskMessage.screenBlocker.show();
    if (Object.hasOwnProperty.call(parentObj, 'content')) {
      parentObj = parentObj.content;
    }
    try {
      let newImage = null;
        if (many) {
          newImage = yield this.createHasMany.perform({
            relationType: recordType,
            parentObj: parentObj,
            attrs: {
              baseSixtyFour: encodedFile,
              [titleKey]: file.name,
              tour: parentObj,
              filename: file.name
            }
          });
        } else if (makeNew) {
          newImage = yield this.newRecord.perform(
            recordType,
            {
              baseSixtyFour: encodedFile,
              [titleKey]: file.name,
              filename: file.name
            }
          );
        } else {
          parentObj.setProperties({
            baseSixtyFour: encodedFile,
            [titleKey]: file.name,
            filename: file.name
          });
          newImage = yield this.saveRecord.perform(parentObj);
        }
        this.taskMessage.message = {
          message: 'Loading new file...',
          type: 'success'
        };
        let savedImage = yield this.store.findRecord(recordType, newImage.id);
        // yield waitForProperty(savedImage, 'mobile', v => v !== null);
        return savedImage;
      } catch (error) {
        this.taskMessage.message = {
          message: 'Upload failed :(',
          type: 'danger'
        };
      }

    this.taskMessage.screenBlocker.hide();
  }

  @task
  *setDefaultMode(tour, mode) {
    tour.setProperties({ mode: mode });
    yield tour.save();
  }

  @task
  *addHasOne(parentObj, childObj, recordType) {
    parentObj.setProperties({ [recordType]: childObj });
    yield this.saveRecord.perform(parentObj);
  }

  @task
  *deleteHasOne(parentObj, childObj, recordType, deleteChild=true) {
    parentObj.setProperties({ [recordType]: null });
    yield this.saveRecord.perform(parentObj);
    if (deleteChild) {
      yield this.deleteRecord.perform(childObj);
    }
  }

  @task
  *rollback(obj) {
    yield obj.rollbackAttributes();
  }
}
