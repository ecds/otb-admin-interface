import { findAll, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | list tours', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /', async function(assert) {
    server.createList('tour', 10);
    await visit('/');

    // return pauseTest();
    assert.equal(currentURL(), '/');
    assert.dom('li').exists({ count: 10 });
    // assert.equal( find('p').length, 10);
  });
});
