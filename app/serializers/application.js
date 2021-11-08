// app/serializers/application.js
import JSONAPISerializer from '@ember-data/serializer/json-api';

import { underscore } from '@ember/string';

export default class Application extends JSONAPISerializer {
  keyForAttribute(attr) {
    return underscore(attr);
  }

  keyForRelationship(rawKey) {
    return underscore(rawKey);
  }
}
