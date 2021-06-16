import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import pell from 'pell';
import { icon as faIcon } from '@fortawesome/fontawesome-svg-core';
import { addObserver } from '@ember/object/observers';

export default class OtbCrudPellEditorComponent extends Component {
  @service crudActions;

  constructor() {
    super(...arguments);
      addObserver(this, 'args.content', this.setContent);
  }

  @action
  setContent() {
    this.crudActions.saveRecord.perform(this.args.model, false);
  }

  editor = null;

  icons = {
    bold: faIcon({ prefix: 'fas', iconName: 'bold' }),
    strikethrough: faIcon({ prefix: 'fas', iconName: 'strikethrough' }),
    underline: faIcon({ prefix: 'fas', iconName: 'underline' }),
    italic: faIcon({ prefix: 'fas', iconName: 'italic' }),
    ulist: faIcon({ prefix: 'fas', iconName: 'list-ul' }),
    olist: faIcon({ prefix: 'fas', iconName: 'list-ol' }),
    link: faIcon({ prefix: 'fas', iconName: 'link' }),
    quote: faIcon({ prefix: 'fas', iconName: 'quote-left' }),
    redo: faIcon({ prefix: 'fas', iconName: 'redo' }),
    undo: faIcon({ prefix: 'fas', iconName: 'undo' })
  }

  @action
  initPell(element) {
    this.editor = pell.init({
      element,
      defaultParagraphSeparator: 'p',
      styleWithCSS: true,
      onChange: this.args.onChange,
      actions: [
        {
          name:'bold',
          icon: this.icons['bold'].html[0],
          title: 'bold',
          result: () => pell.exec('bold')
        },
        {
          name:'strikethrough',
          icon: this.icons['strikethrough'].html[0],
          title: 'strikethrough',
          result: () => pell.exec('strikethrough')
        },
        {
          name:'underline',
          icon: this.icons['underline'].html[0],
          title: 'underline',
          result: () => pell.exec('underline')
        },
        {
          name:'italic',
          icon: this.icons['italic'].html[0],
          title: 'italic',
          result: () => pell.exec('italic')
        },
        {
          name:'ulist',
          icon: this.icons['ulist'].html[0],
          title: 'ulist',
          result: () => pell.exec('insertUnorderedList')
        },
        {
          name:'olist',
          icon: this.icons['olist'].html[0],
          title: 'olist',
          result: () => pell.exec('insertOrderedList')
        },
        {
          name:'link',
          icon: this.icons['link'].html[0],
          title: 'link',
          result: () => {
            const url = window.prompt('Enter the link URL')
            if (url) pell.exec('createLink', url)
          }
        },
        {
          name:'quote',
          icon: this.icons['quote'].html[0],
          title: 'quote',
          result: () => pell.exec('formatBlock', '<blockquote>')
        },
        {
          name: 'undo',
          icon: this.icons['undo'].html[0],
          title: 'Undo',
          result: function result() {
            return pell.exec('undo');
          }
        },
        {
          name: 'redo',
          icon: this.icons['redo'].html[0],
          title: 'redo',
          result: function result() {
            return pell.exec('redo');
          }
        }
      ]
    });
    this.editor.content.innerHTML = this.args.content;
  }



  @action
  updateSource(event) {
    this.editor.content.innerHTML = event.target.value;
  }
}
