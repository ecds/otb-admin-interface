import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class LanguageSelectComponent extends Component {
  languages = [
    {
      code: 'en-US',
      label: 'English'
    },
    {
      code: 'fr-FR',
      label: 'French '
    },
    {
      code: 'de-DE',
      label: 'German '
    },
    {
      code: 'pl-PL',
      label: 'Polish '
    },
    {
      code: 'nl-NI',
      label: 'Dutch  '
    },
    {
      code: 'fi-FI',
      label: 'Finnish'
    },
    {
      code: 'sv-SE',
      label: 'Swedish'
    },
    {
      code: 'it-IT',
      label: 'Italian'
    },
    {
      code: 'es-ES',
      label: 'Spanish (Spain)'
    },
    {
      code: 'pt-PT',
      label: 'Portuguese (Portugal)'
    },
    {
      code: 'ru-RU',
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
      code: 'ja-JP',
      label: 'Japanese'
    },
    {
      code: 'ko-KR',
      label: 'Korean '
    }
  ];

  @action
  update(event) {
    this.args.model.setProperties({ defaultLng: event.target.value });
    this.args.save.perform(this.args.model);
  }
}
