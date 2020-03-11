import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Torii from 'ember-simple-auth/authenticators/torii';
import ENV from '../config/environment';
import fetch from 'fetch';
import { task } from 'ember-concurrency';

export default Torii.extend({
  torii: service(),
  session: service(),
  currentUser: service(),
  tenant: service(),

  authenticate(/*provider, options*/) {
    return this._super(...arguments).then(data => {
      return this.get('setAuthData').perform(data);
    });
  },

  setAuthData: task(function * (data) {
    let response = yield fetch(`${ENV.APP.API_HOST}/${this.get('tenant.tenant')}/token`, {
      method: 'POST',
      headers: {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7,fr;q=0.6",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
      },
      body: JSON.stringify({
        grant_type: 'google_auth_code',
        auth_code: data.access_token
      })
    });

    let responseData = yield response.json();

    // It is VERY important that `provider` match the name of the Torii provider.
    // Otherwise, the auth status will not persist on reload.
    return {
      access_token: responseData.access_token,
      provider: data.provider
    }
  }),

  // authenticate() {

  //   return this._super(...arguments).then(data => {
  //     let grantType = 'password';
  //     if (data.provider.includes('google')) {
  //       grantType = 'google_auth_code';
  //     } else if (data.provider.includes('facebook')) {
  //       grantType = 'facebook_auth_code';
  //       data.access_token = data.authorizationCode;
  //     }
  //     return fetch(`${ENV.APP.API_HOST}/${this.get('tenant.tenant')}/token`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json'
  //         },
  //         body: JSON.stringify({
  //           grant_type: grantType,
  //           auth_code: data.access_token
  //         })
  //       })
  //       .then(response => {
  //       console.log("authenticate -> response", response)
  //       const responseData = response.json();

  //           console.log("authenticate -> response", JSON.stringify(this.session))
  //             const authData = {
  //               access_token: responseData.access_token,
  //               provider: data.provider
  //             };
  //             // this.currentUser.load();
  //             console.log("authenticate -> authData", authData)
  //             return authData;
  //         // })
  //       });
  //   });
  // },

  logOut() {

    return this._super(...arguments.then(function dip() {
        return fetch(
          `${ENV.APP.API_HOST}/${this.get('tenant.tenant')}/revoke`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: {
              token: get(this, 'session.content.authenticated.access_token')
            }
          }
        );
      })
    );
  }
});
