import Mixin from '@ember/object/mixin';
import { task, timeout, waitForProperty } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { pluralize } from 'ember-inflector';
import UIkit from 'uikit';

export default Mixin.create({
  store: service(),
  tenant: service(),

  newRecord: task(function*(type, attrs) {
    attrs = attrs.hasOwnProperty('target') ? {} : attrs;
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
  }),

  createHasMany: task(function*(options) {
    let attrs = isEmpty(options.attrs) ? {} : options.attrs;
    let childObj = isEmpty(options.childObj)
      ? this.store.createRecord(options.relationType, attrs)
      : options.childObj;
    if (childObj.hasDirtyAttributes) {
      yield this.saveRecord.perform(childObj);
    }
    options.parentObj
      .get(`${pluralize(options.relationType)}`)
      .pushObject(childObj);
    let newChild = yield this.saveRecord.perform(childObj);
    yield options.parentObj.save();
    // yield waitForProperty(newImage, 'mobile', v => v !== null);

    return newChild;
  }),

  deleteHasMany: task(function*(options) {
    let didConfirm = yield this.confirmDelete.perform(
      options.childObj.get('title')
    );
    let parentObj = options.parentObj.hasOwnProperty('isFulfilled')
      ? options.parentObj.content
      : options.parentObj;
    let childObj = options.childObj.hasOwnProperty('isFulfilled')
      ? options.childObj.content
      : options.childObj;
    if (didConfirm) {
      parentObj
        .get(`${pluralize(options.relationType)}`)
        .removeObject(childObj);
      try {
        yield parentObj.save();
        yield childObj.save();
      } catch (error) {
        UIkit.notification(`ERROR: ${error}`, { status: 'danger' });
      } finally {
        if (options.reorder) {
          yield timeout(300);
          yield this.reorder.perform(`${options.relationType}List`);
        }
      }
      return true;
    }
  }),

  toggleHasMany: task(function*(options, event) {
    // let options = {
    //   relationType: event.target.name,
    //   parentObj: parent,
    //   childObj: child
    // };
    if (event.target.checked) {
      return yield this.createHasMany.perform(options);
    } else {
      return yield this.deleteHasMany.perform(options);
    }
  }),

  deleteRecord: task(function*(obj) {
    let didConfirm = yield this.confirmDelete.perform();
    if (didConfirm) {
      obj.deleteRecord();
      return yield obj.save();
    }
  }),

  confirmDelete: task(function*(title) {
    try {
      yield UIkit.modal.confirm(`DELETE ${title}`, { status: 'danger' });
      return true;
    } catch (nah) {
      return false;
    }
  }),

  reorder: task(function*(event) {
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
      list = document.getElementById(event).firstChild.children;
    }
    this.set('taskMessage', {
      message: `Saving new order 0 of ${list.length}`,
      type: 'success'
    });

    const modal = this.screenBlocker;
    modal.show();
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
      this.set('taskMessage', {
        message: `Saving new order ${index} of ${list.length}`,
        type: 'success'
      });
      index++;
      yield storeItem.save();
    }
    this.set('taskMessage', 'ALL DONE!');
    yield timeout(300);
    modal.hide();
    modal.$destroy;
    window.onbeforeunload = null;
  }),

  saveRecord: task(function*(obj) {
    this.tenant.setTenant();
    this.set('taskMessage', {
      message: 'Saving...',
      type: 'success'
    });
    const modal = this.screenBlocker;
    if (modal) modal.show();
    obj = obj.hasOwnProperty('isFulfilled') ? obj.content : obj;
    if (!obj.hasOwnProperty('store')) {
      // console.error('You must pass a store object to saveRecord.');
      return false;
    }
    try {
      yield obj.save();
      this.set('taskMessage', {
        message: `SAVED: ${obj.title}`,
        type: 'success'
      });
      yield timeout(1000);
    } catch (error) {
      console.log("saveRecord:task -> error", error)
      this.set('taskMessage', {
        message: `ERROR: ${error}`,
        type: 'danger'
      });
      yield timeout(5000);
    } finally {
      if (modal) modal.hide();
      if (modal) modal.$destroy;
    }
    return obj;
  }).drop(),

  uploadFile: task(function*(parentObj, file) {
    const reader = new FileReader();
    let encodedFile = yield file.readAsDataURL();
    this.set('taskMessage', {
      message: 'Uploading medium...',
      type: 'success'
    });
    const modal = this.screenBlocker;
    modal.show();
    if (parentObj.hasOwnProperty('content')) {
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
      this.set('taskMessage', {
        message: 'Loading new image...',
        type: 'success'
      });
      let savedImage = yield this.store.findRecord('medium', newImage.id);
      yield waitForProperty(savedImage, 'mobile', v => v !== null);
    } catch {
      this.set('taskMessage', {
        message: 'Upload failed :(',
        type: 'danger'
      })
    }

    modal.hide();
    modal.$destroy;
  }),

  setDefaultMode: task(function*(tour, mode) {
    tour.setProperties({ mode: mode });
    yield this.saveRecord.perform(tour);
  })
});
