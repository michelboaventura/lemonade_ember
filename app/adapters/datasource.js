import DS from 'ember-data';
import Ember from 'ember';
import config from '../config/environment';

export default DS.JSONAPIAdapter.extend({
  host: `${config.stand}`,
  session: Ember.inject.service('session'),
  headers: Ember.computed('session.data.authenticated', function() {
    var authenticated = this.get('session.data.authenticated');
    return {
      'X-Auth-Token': '123456',
      'X-User-Id': authenticated.id,
      'access-token': authenticated.accessToken,
      'client': authenticated.client,
      'expiry': authenticated.expiry,
      'uid': authenticated.uid
    };
  })
});

