import { helper } from '@ember/component/helper';

export default helper(function sum(addends) {
  return addends.reduce((a, b) => a + b, 0);
});
