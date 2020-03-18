import classic from 'ember-classic-decorator';
import Cookie from 'ember-simple-auth/session-stores/cookie';

@classic
export default class Application extends Cookie {}
