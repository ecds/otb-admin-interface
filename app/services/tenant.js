import Service from '@ember/service';
import { isEmpty } from '@ember/utils';
import ENV from '../config/environment';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TenantService extends Service {
  @service store;

  @tracked
  tenant = 'public';

  @tracked
  tenantModel = null;

  async setTenant(path = window.location.pathname) {
    if (ENV.APP.TENANT) {
      this.tenant = ENV.APP.TENANT;
      return true;
    }
    if (typeof path !== 'string') {
      return false;
    }
    const pathParts = path.replace(/\/$/, '').split('/');
    const firstSubDir = pathParts.length > 1 ? pathParts[1] : pathParts[0];
    /*
       Like the router, this is complicated and should be given more thought.
       Reasons we want to switch to the public tenant/scheme:
       1) Not going to a multi-site instance
       2) Super user going to the admin interface
       3) User trying to login
    */
    if (
      !firstSubDir ||
      parseInt(firstSubDir) ||
      (firstSubDir === 'admin' && pathParts.length <= 2) ||
      // Reverse pathParts without modifying it.
      (firstSubDir === 'admin' && [...pathParts].reverse()[0] === 'users') ||
      (firstSubDir === 'admin' && [...pathParts].reverse()[0] === 'login') ||
      firstSubDir === 'tour' ||
      firstSubDir === 'tours' ||
      firstSubDir === 'login' ||
      firstSubDir === 'index' ||
      pathParts[2] === 'users' ||
      firstSubDir.length === 0
    ) {
      this.tenant = 'public';
    } else if (firstSubDir === 'admin' && pathParts.length > 2) {
      this.tenant = pathParts[2];
    } else {
      this.tenant = firstSubDir;
    }
    let tourSets = await this.store.query('tour-set', {
      subdir: this.tenant
    });

    this.tenantModel = tourSets.firstObject;
  }

  setTenantFromContext(context) {
    if (isEmpty(context)) {
      this.setTenant();
    } else if (typeof context === 'string') {
      this.tenant = context;
    } else if (isNaN(context[0]) && typeof context[0] === 'string') {
      this.tenant = context.firstObject;
    } else if (Object.prototype.hasOwnProperty.call(context.params[context.targetName], 'tenant')) {
      this.tenant = context.params[context.targetName].tenant;
    } else {
      this.setTenant();
    }
  }
}
