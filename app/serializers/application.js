// app/serializers/application.js
import JSONAPISerializer from '@ember-data/serializer/json-api';

import { underscore } from '@ember/string';

export default JSONAPISerializer.extend({
  keyForAttribute: function removeDashes(attr) {
    return underscore(attr);
  },

  keyForRelationship: function removeDashes(rawKey) {
    return underscore(rawKey);
  }
});
