import EmberObject from '@ember/object';
import CrudActions from 'open-tour-builder/mixins/crud-actions';
import { module, test } from 'qunit';

module('Unit | Mixin | crud-actions', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let CrudActionsObject = EmberObject.extend(CrudActions);
    let subject = CrudActionsObject.create();
    assert.ok(subject);
  });
});
