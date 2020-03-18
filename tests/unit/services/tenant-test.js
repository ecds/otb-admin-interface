import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | tenant', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const service = this.owner.lookup('service:tenant');
    assert.ok(service);
    assert.equal(service.get('domain'), 'localhost');
  });
});
