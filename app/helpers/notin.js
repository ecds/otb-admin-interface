import { helper } from '@ember/component/helper';

export function notin([list, item]) {
  return !list.includes(item);
}

export default helper(notin);
