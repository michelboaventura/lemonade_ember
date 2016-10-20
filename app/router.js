import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('workflows');
  this.route('workflow');
  this.route('workflow', {path: 'workflow/:id'});
  this.route('login');
  this.route('signup');
  this.route('policy');
  this.route('change',{path:'users/password/edit'});
  this.route('password', function() {
    this.route('change');
    this.route('request');
  });
});

export default Router;
