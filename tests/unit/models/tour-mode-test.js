import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { run } from '@ember/runloop';

module('Unit | Model | tour mode', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = run(() => this.owner.lookup('service:store').createRecord('tour-mode'));
    // let store = this.store();
    assert.ok(!!model);
  });
});
