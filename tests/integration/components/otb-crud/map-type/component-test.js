import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, select } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | otb-crud/map-type', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.server.loadFixtures();
    this.set('store', this.owner.lookup('service:store'));
    const tour = await this.store.findRecord('tour', 1);

    const save = {
      perform: function () { return true; }
    };

    this.set('save', save);
    this.set('model', tour);
  });

  test('it renders', async function(assert) {
    await render(hbs`<OtbCrud::MapType @model={{this.model}} />`);
    assert.dom('select').hasValue('hybrid');
  });

  test('it updates tour\'s mapType', async function(assert) {
    await render(hbs`<OtbCrud::MapType @model={{this.model}} @save={{this.save}} />`);
    await select('select', 'terrain');
    assert.equal(this.model.mapType, 'terrain');
  });
});
