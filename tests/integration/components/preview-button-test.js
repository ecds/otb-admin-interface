import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | preview-button', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{preview-button}}`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      {{#preview-button}}
        template block text
      {{/preview-button}}
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
