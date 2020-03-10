import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | otb-crud/new-button', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{otb-crud/new-button}}`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      {{#otb-crud/new-button}}
        template block text
      {{/otb-crud/new-button}}
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
