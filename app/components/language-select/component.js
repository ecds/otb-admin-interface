import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class LanguageSelectComponent extends Component {
  languages = [
    {
      code: 'en',
      label: 'English'
    },
    {
      code: 'fr',
      label: 'French '
    },
    {
      code: 'de',
      label: 'German '
    },
    {
      code: 'pl',
      label: 'Polish '
    },
    {
      code: 'nl',
      label: 'Dutch  '
    },
    {
      code: 'fi',
      label: 'Finnish'
    },
    {
      code: 'sv',
      label: 'Swedish'
    },
    {
      code: 'it',
      label: 'Italian'
    },
    {
      code: 'es',
      label: 'Spanish (Spain)'
    },
    {
      code: 'pt',
      label: 'Portuguese (Portugal)'
    },
    {
      code: 'ru',
      label: 'Russian'
    },
    {
      code: 'pt-BR',
      label: 'Portuguese (Brazil)'
    },
    {
      code: 'es-MX',
      label: 'Spanish (Mexico)'
    },
    {
      code: 'zh-CN',
      label: 'Chinese (PRC)   '
    },
    {
      code: 'zh-TW',
      label: 'Chinese (Taiwan)'
    },
    {
      code: 'ja',
      label: 'Japanese'
    },
    {
      code: 'ko',
      label: 'Korean '
    }
  ];

  @action
  update(event) {
    this.args.model.setProperties({ defaultLng: event.target.value });
    this.args.save.perform(this.args.model);
  }
}
