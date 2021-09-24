/* eslint-disable ember/no-classic-classes */
import EmberRouter from '@ember/routing/router';
import { computed } from '@ember/object';

const Router = EmberRouter.extend({
  location: 'trailingHistory',
  /** This is a little too complicated, but here we go.
    We set the root url to '/' if:
    1) The path is 'admin'
    2) There is no path - meaning going to public tenant
    3) The path is a number - meaning tour on public tenant
  */
  rootURL: computed('', function() {
    let path = window.location.pathname.replace(/\/$/, '').split('/')[1];
    if (path === 'admin' || path === 'login' || !path || parseInt(path)) {
      return '/admin/';
    } else if (path) {
      return `/admin/${path}/`;
    }
    return '/';
  })
});

Router.map(function() {
  this.route(
    'admin',
    {
      path: ''
    },
    function() {
      this.route('users', function() {
        this.route('user', {
          path: '/:user_id'
        });
      });
      this.route(
        'tours',
        {
          path: ':*/'
        },
        function() {
          this.route('index', {
            path: '/'
          });
          this.route('edit', {
            path: 'edit/:tour_id'
          });
        }
      );
    }
  );

  this.route('login', {
    path: '/login/'
  });
});

export default Router;
/* eslint-enable ember/no-classic-classes */
