import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | otb-crud/video', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.server.loadFixtures('tours');
    this.set('store', this.owner.lookup('service:store'));
    const tour = await this.store.findRecord('tour', 1);

    const save = {
      perform: function () { return true; }
    };

    this.set('model', tour);
    this.set('save', save);
  });

  test('it renders', async function(assert) {
    await render(hbs`<OtbCrud::Video @model={{this.model}} @save={{this.save}} />`);
    assert.dom(`input#${this.model.slug}-video-${this.model.id}`).exists();
  });

  test('it adds a YouTube video from browser url', async function(assert) {
    await render(hbs`<OtbCrud::Video @model={{this.model}} @save={{this.save}} />`);
    await fillIn(`input#${this.model.slug}-video-${this.model.id}`, `${location.protocol}//www.youtube.com/watch?v=lVehcuJXe6I`);
    await click('button');
    assert.dom('iframe').hasProperty('src', `${location.protocol}//www.youtube.com/embed/lVehcuJXe6I`);
    assert.dom(`span#${this.model.slug}-video-code-${this.model.id}`).hasText('lVehcuJXe6I');
  });

  test('it adds a YouTube video from share url', async function(assert) {
    await render(hbs`<OtbCrud::Video @model={{this.model}} @save={{this.save}} />`);
    await fillIn(`input#${this.model.slug}-video-${this.model.id}`, `${location.protocol}//youtu.be/lVehcuJXe6I`);
    await click('button');
    assert.dom('iframe').hasProperty('src', `${location.protocol}//www.youtube.com/embed/lVehcuJXe6I`);
    assert.dom(`span#${this.model.slug}-video-code-${this.model.id}`).hasText('lVehcuJXe6I');
  });

  test('it adds a YouTube video from embed code', async function(assert) {
    const embedCode = `<iframe width="560" height="315" src=${location.protocol}//www.youtube.com/embed/lVehcuJXe6I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    await render(hbs`<OtbCrud::Video @model={{this.model}} @save={{this.save}} />`);
    await fillIn(`input#${this.model.slug}-video-${this.model.id}`, embedCode);
    await click('button');
    assert.dom('iframe').hasProperty('src', `${location.protocol}//www.youtube.com/embed/lVehcuJXe6I`);
    assert.dom(`span#${this.model.slug}-video-code-${this.model.id}`).hasText('lVehcuJXe6I');
  });

  test('it adds a Vimeo video from browser url', async function(assert) {
    await render(hbs`<OtbCrud::Video @model={{this.model}} @save={{this.save}} />`);
    await fillIn(`input#${this.model.slug}-video-${this.model.id}`, `${location.protocol}//vimeo.com/259134302`);
    await click('button');
    assert.dom('iframe').hasProperty('src', `${location.protocol}//player.vimeo.com/video/259134302`);
    assert.dom(`span#${this.model.slug}-video-code-${this.model.id}`).hasText('259134302');
  });

  test('it adds a Vimeo video from embed code', async function(assert) {
    const embedCode = `<iframe src=${location.protocol}//player.vimeo.com/video/259134302" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe><p><a href=${location.protocol}//vimeo.com/259134302">MIGOS  ||  S T I R   F R Y</a> from <a href=${location.protocol}//vimeo.com/singjlee">Sing J. Lee</a> on <a href=${location.protocol}//vimeo.com">Vimeo</a>.</p>`;
    await render(hbs`<OtbCrud::Video @model={{this.model}} @save={{this.save}} />`);
    await fillIn(`input#${this.model.slug}-video-${this.model.id}`, embedCode);
    await click('button');
    assert.dom('iframe').hasProperty('src', `${location.protocol}//player.vimeo.com/video/259134302`);
    assert.dom(`span#${this.model.slug}-video-code-${this.model.id}`).hasText('259134302');
  });

  test('it shows an error', async function(assert) {
    await render(hbs`<OtbCrud::Video @model={{this.model}} @save={{this.save}} />`);
    await fillIn(`input#${this.model.slug}-video-${this.model.id}`, 'embedCode');
    await click('button');
    assert.dom('div.uk-alert-danger').hasText('Could not find video. Please try again.');
  });
});
