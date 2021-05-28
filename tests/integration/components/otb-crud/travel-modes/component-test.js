import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | otb-crud/travel-modes', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.server.loadFixtures();
    this.set('store', this.owner.lookup('service:store'));
    const tour = await this.store.findRecord('tour', 1);
    const modes = await this.store.findAll('mode');

    const tourModes = tour.get('modes');
    tourModes.pushObject(this.store.peekRecord('mode', 1));
    tourModes.pushObject(this.store.peekRecord('mode', 4));
    tour.setProperties({ mode: this.store.peekRecord('mode', 1)});

    this.set('model', { tour, modes });
  });

  test('it renders', async function(assert) {
    await render(hbs`<OtbCrud::TravelModes @model={{this.model}} />`);
    assert.dom('div.uk-width-1-2').hasText('Mode');
    // Checkboxes
    assert.dom('input#BICYCLING').isDisabled();
    assert.dom('input#BICYCLING').isChecked();
    assert.dom('input#WALKING').isChecked();
    assert.dom('input#TRANSIT').isNotChecked();
    assert.dom('input#DRIVING').isNotChecked();
    // Radio buttons
    assert.dom('input#BICYCLING-default').isChecked();
    assert.dom('input#WALKING-default').isEnabled();
    assert.dom('input#WALKING-default').isNotChecked();
    assert.dom('input#TRANSIT-default').isDisabled();
    assert.dom('input#TRANSIT-default').isNotChecked();
    assert.dom('input#DRIVING-default').isNotChecked();
    assert.dom('input#DRIVING-default').isDisabled();
  });

  test('it updates which modes are enabled', async function(assert) {
    await render(hbs`<OtbCrud::TravelModes @model={{this.model}} />`);
    await click('input#WALKING');
    await click('input#TRANSIT');
    const tourModes = this.model.tour.get('modes');
    assert.ok(tourModes.includes(this.store.peekRecord('mode', 3)));
    assert.notOk(tourModes.includes(this.store.peekRecord('mode', 4)));
    // Checkboxes
    assert.dom('input#BICYCLING').isDisabled();
    assert.dom('input#BICYCLING').isChecked();
    assert.dom('input#WALKING').isNotChecked();
    assert.dom('input#TRANSIT').isChecked();
    assert.dom('input#DRIVING').isNotChecked();
    // Radio buttons
    assert.dom('input#BICYCLING-default').isChecked();
    assert.dom('input#WALKING-default').isDisabled();
    assert.dom('input#WALKING-default').isNotChecked();
    assert.dom('input#TRANSIT-default').isEnabled();
    assert.dom('input#TRANSIT-default').isNotChecked();
    assert.dom('input#DRIVING-default').isNotChecked();
    assert.dom('input#DRIVING-default').isDisabled();
  });

  test('it updates the default travel mode', async function(assert) {
    await render(hbs`<OtbCrud::TravelModes @model={{this.model}} />`);
    await click('input#WALKING-default');
    const tourMode = this.model.tour.get('mode.title');
    assert.equal(tourMode, 'WALKING');
    // Checkboxes
    assert.dom('input#BICYCLING').isChecked();
    assert.dom('input#WALKING').isChecked();
    assert.dom('input#WALKING').isDisabled();
    assert.dom('input#TRANSIT').isNotChecked();
    assert.dom('input#DRIVING').isNotChecked();
    // Radio buttons
    assert.dom('input#BICYCLING-default').isNotChecked();
    assert.dom('input#BICYCLING-default').isEnabled();
    assert.dom('input#WALKING-default').isChecked();
    assert.dom('input#TRANSIT-default').isDisabled();
    assert.dom('input#TRANSIT-default').isNotChecked();
    assert.dom('input#DRIVING-default').isNotChecked();
    assert.dom('input#DRIVING-default').isDisabled();
  });
});
