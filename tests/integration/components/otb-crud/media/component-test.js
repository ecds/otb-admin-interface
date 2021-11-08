import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | otb-crud/media', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.server.loadFixtures();
    this.set('crudActions', this.owner.lookup('service:crudActions'));

    this.set('store', this.owner.lookup('service:store'));
    const tour = await this.store.findRecord('tour', 1);
    const media = await this.store.findAll('medium');
    const tourMedia = tour.get('media');
    media.forEach(medium => tourMedia.pushObject(medium));
    this.store.createRecord('tourMedium', { id: 1, tour, medium: this.store.peekRecord('medium', 1), position: 1 });
    this.store.createRecord('tourMedium', { id: 2, tour, medium: this.store.peekRecord('medium', 2), position: 2 });
    const save = {
      perform: function () { return true; }
    };

    this.set('tour', tour);
    this.set('save', save);
  });

  test('it renders', async function(assert) {
    await render(hbs`<OtbCrud::Media @model={{this.tour}} />`);
    assert.dom('p').hasText('Media Count: 2');
    assert.dom(`img#medium-${this.tour.slug}1`).exists();
    assert.dom('#play-button-22.otb-playbutton-overlay').exists();
  });

  test('it reorders', async function(assert) {
    assert.equal(this.store.peekRecord('tourMedium', 2).position, 2);
    await render(hbs`<OtbCrud::Media @model={{this.tour}} @reorder={{this.crudActions.reorder}} />`);
    const imageOne = find(`#medium-card-${this.tour.slug}1`);
    const imageTwo = find(`#medium-card-${this.tour.slug}2`);
    imageOne.parentNode.replaceChild(imageOne, imageTwo);
    imageOne.parentNode.insertBefore(imageTwo, imageOne);
    await triggerEvent('.uk-sortable', 'stop');
    assert.dom('p').hasText('Media Count: 2');
    assert.dom(`img#medium-${this.tour.slug}1`).exists();
    assert.dom('#play-button-22.otb-playbutton-overlay').exists();
    assert.equal(this.store.peekRecord('tourMedium', 2).position, 1);
  });
});
