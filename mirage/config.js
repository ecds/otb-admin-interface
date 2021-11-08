export default function() {
    // These comments are here to help you get started. Feel free to delete them.

    /*
      Config (with defaults).

      Note: these only affect routes defined *after* them!
    */

    //this.urlPrefix = 'http://localhost.otb.org:3000';    // make this `http://localhost:8080`, for example, if your API is on a different server
    // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
    // this.timing = 400;      // delay for each request, automatically set to 0 during testing
    this.namespace = 'public';

    this.get('/users/me');
    this.resource('users');
    this.resource('tours');
    this.resource('tour-sets');
    this.resource('tour-stops');
    this.resource('stops');
    this.resource('media');
    this.resource('tour-media');
    this.resource('stop-media');
    this.resource('modes');
    this.resource('themes');
    this.resource('tour-modes');
}
