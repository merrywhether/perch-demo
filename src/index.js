let $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    HandlebarsRuntime = require('hbsfy/runtime');

Backbone.$ = $;
window.$ = $;
window.jQuery = $;

let events = require('./components/events'),
    userManager = require('./components/user'),
    perchManager = require('./components/perches').perchManager;

let Navigation = require('./components/navigation'),
    WelcomeView = require('./pages/welcome'),
    LoginView = require('./pages/login'),
    CreatePerchView = require('./pages/createPerch'),
    PerchAdminView = require('./pages/perchAdmin'),
    BrowseView = require('./pages/browse'),
    HomeView = require('./pages/home');

let registerHelpers = require('./templates/hbsHelpers');
registerHelpers(HandlebarsRuntime);

class App extends Backbone.Router {
  initialize(options) {
    super.initialize(options);

    userManager.initialize();
    perchManager.initialize();

    this.route('*path', 'all');
    this.route('home', 'home');
    this.route('login', 'login');
    this.route('createPerch', 'createPerch');
    this.route('perchAdmin/:id', 'perchAdmin');
    this.route('logout', 'logout');
    this.route('browse', 'browse');

    this.navigation = new Navigation({el: 'header'});
    this.navigation.render();

  }
  all() {
    Backbone.history.navigate('home', {trigger: true});
  }
  home() {
    events.trigger('navigation', 'home');
    if (userManager.isLoggedIn()) {
      this.homeView = this.homeView || new HomeView({el: 'main'});
      this.homeView.viewWillLoad();
      this.homeView.render();
    } else {
      this.welcomeView = this.welcomeView || new WelcomeView({el: 'main'});
      this.welcomeView.render();
    }
  }
  login() {
    if (userManager.isLoggedIn()) {
      Backbone.history.navigate('home', {trigger: true});
      return;
    }
    events.trigger('navigation', 'login');
    this.loginView = this.loginView || new LoginView({el: 'main'});
    this.loginView.render();
  }
  logout() {
    if (!userManager.isLoggedIn()) {
      Backbone.history.navigate('home', {trigger: true});
      return;
    }
    userManager.logout().then((response) => {
      if (!response.logout) {
        Materialize.toast('Logout failed. Please try again.', 4000, 'error-toast');
      }
      Backbone.history.navigate('home', {trigger: true});
    });
  }
  browse() {
    events.trigger('navigation', 'browse');
    this.browseView = this.browseView || new BrowseView({el: 'main'});
    this.browseView.viewWillLoad();
    this.browseView.render();
  }
  createPerch() {
    events.trigger('navigation', 'createPerch');
    this.createPerchView = this.createPerchView || new CreatePerchView({el: 'main'});
    this.createPerchView.render();
  }
  perchAdmin(id) {
    events.trigger('navigation', 'perchAdmin');
    this.perchAdminView = this.perchAdminView || new PerchAdminView({el: 'main'});
    this.perchAdminView.viewWillLoad(id);
    this.perchAdminView.render();
  }
  start() {
    Backbone.history.start({
      pushState: false,
      root: '/~keravuor/cs290/perch/'
    });
  }
}

let app = new App();

$(() => {
  app.start();
  $('.button-collapse').sideNav();
});
