import { helper } from '@ember/component/helper';
import { get } from '@ember/object';
import { htmlSafe } from '@ember/string';

export function mediaThumbnail([medium, version, width]) {
  let imageElement = `<img width=${width}
                        data-src='${medium.baseUrl}${get(
  medium,
  version
)}'
                        alt='Picture of ${medium.title}.
                        ${medium.caption}' uk-img/>`;

  if (medium.video) {
    return htmlSafe(`${imageElement}
            <div class='uk-position-center uk-panel otb-playbutton-overlay'>
              <i class='fa fa-play-circle' aria-hidden='true'></i>
            </div>`);
  }
  return htmlSafe(imageElement);
}

export default helper(mediaThumbnail);
