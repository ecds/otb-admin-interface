import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | otb-crud/common-form', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.server.loadFixtures('tours');
    this.set('store', this.owner.lookup('service:store'));
    const tour = await this.store.findRecord('tour', 1);
    this.set('model', tour);
  });

  test('it renders a form', async function(assert) {
    await render(hbs`<OtbCrud::CommonForm @model={{this.model}} @modelTitle="Tour" />`);
    assert.dom(`input#${this.model.slug}-title`).hasValue(this.model.title);
    assert.dom(`input#${this.model.slug}-published`).isNotChecked();
    assert.dom('.pell-content').hasText(this.model.description);
    assert.dom(`textarea#${this.model.slug}-description-source`).hasValue(this.model.description);
    assert.dom(`textarea#${this.model.slug}-Tour-meta-description`).hasValue(this.model.metaDescription);
  });

  test('it updates model attributes', async function(assert) {
    await render(hbs`<OtbCrud::CommonForm @model={{this.model}} @modelTitle="Tour" />`);
    await fillIn(`input#${this.model.slug}-title`, 'Jay\'s Totally Awesome Burrito Tour');

    assert.equal(this.model.title, 'Jay\'s Totally Awesome Burrito Tour');

    assert.notOk(this.model.published);
    await click(`input#${this.model.slug}-published`);
    assert.ok(this.model.published);

    await fillIn(`textarea#${this.model.slug}-description-source`, 'hello');
    assert.equal(this.model.description, 'hello');

    await fillIn(`textarea#${this.model.slug}-Tour-meta-description`, 'poop');
    assert.equal(this.model.metaDescription, 'poop');
  });

  test('it does not render a published checkbox for non-tours', async function(assert) {
    await render(hbs`<OtbCrud::CommonForm @model={{this.model}} @modelTitle="Stop" />`);
    assert.dom(`input#${this.model.slug}-published`).doesNotExist();
  });
});
