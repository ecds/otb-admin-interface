import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | otb-crud/theme-picker', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.server.loadFixtures();

    this.set('store', this.owner.lookup('service:store'));
    const tour = await this.store.findRecord('tour', 1);
    const themes = await this.store.findAll('theme');
    tour.setProperties({
      theme: this.store.peekRecord('theme', 2)
    });
    const save = {
      perform: function () { return true; }
    };

    this.set('tour', tour);
    this.set('save', save);
    this.set('themes', themes);
  });

  test('it renders', async function(assert) {
    await render(hbs`<OtbCrud::ThemePicker @model={{this.tour}} @save={{this.save}} />`);
    assert.dom('input#red').isChecked();
  });

  test('it updates tour theme', async function(assert) {
    await render(hbs`<OtbCrud::ThemePicker @model={{this.tour}} @save={{this.save}} />`);
    assert.ok(true);
    assert.equal(this.tour.get('theme.title'), this.store.peekRecord('theme', 2).title);
    await click('img#dark-blue-preview');
    assert.equal(this.tour.get('theme.title'), this.store.peekRecord('theme', 3).title);
  });
});
