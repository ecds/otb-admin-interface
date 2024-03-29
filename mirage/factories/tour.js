import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
    title() {
        return faker.address.city();
    },
    description() {
        return  faker.lorem.paragraphs();
    },
    is_geo() {
        return faker.random.boolean;
    },

    withStops: trait({
        afterCreate(tour, server) {
            server.createList('tour_stop', 10, { tour });
        }
    })
});
