import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | show stop', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /tour/1/stop', async assert => {
    let tour = server.create('tours');
    let stop = server.create('tour_stop', {tour});
    await visit(`/tour/${tour.id}/stop/${stop.id}`);

    assert.equal(currentURL(), `/tour/${tour.id}/stop/${stop.id}`);
  });
});
