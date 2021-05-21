import Component from '@ember/component';
// import { Jodit } from '../../node_modules/jodit/src/Jodit';
/* global Jodit */

export default Component.extend({

  editor: null,
  modelAttr: null,

  didInsertElement() {
    const editor = new Jodit(this.element, {
      defaultActionOnPaste: 'insert_as_text',
      buttons:
        'source,bold,strikethrough,underline,italic,,,|,ul,ol,|,outdent,indent,|,link,,align,undo,redo',
      readonly: false,
      onChange: this.send('update')
    });
    editor.value = this.value;
    editor.events.on('change', newValue => {
      this.onChange(newValue);
    });
    if (this.model && this.modelAttr && this.model.content) {
      if (!this.model.editors) {
        this.model.setProperties({
          editors: {}
        });
      }
      this.model.get('editors')[this.modelAttr] = editor;
    }
    this.set('editor', editor);
  },

  actions: {
    update(/*e*/) {
      // console.log(e);
    }
  }
});
