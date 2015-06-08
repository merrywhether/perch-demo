let Backbone = require('backbone');

let events = require('./events'),
    userManager = require('./user');

let navigationTemplate = require('./../templates/navigation/nav.hbs'),
    navItemTopTemplate = require('./../templates/navigation/navItemTop.hbs'),
    navItemMobileTemplate = require('./../templates/navigation/navItemMobile.hbs');


class NavItem extends Backbone.Model {
  initialize(options) {
    super.initialize(options);
    this.listenTo(events, 'navigation', this.toggleActive);
  }
  toggleActive(id) {
    if (this.id == id) {
      this.set({active: true});
    } else {
      this.set({active: false});
    }
  }
  defaults() { return { active: false }; }
}

class NavItemView extends Backbone.View {
  initialize(options) {
    super.initialize(options);
    this.listenTo(this.model, 'change:active', this.render);
  }
  tagName() { return 'li'; }
  events() {
    return {
      'click': 'navigate'
    };
  }
  navigate(e) {
    e.preventDefault();
    Backbone.history.navigate(this.model.id, {trigger: true});
    window.scrollTo(0, 0);
  }
  render(context) {
    if (context == 'top') {
      this.$el.html(navItemTopTemplate(this.model.attributes));
    } else if (context == 'mobile') {
      this.$el.html(navItemMobileTemplate(this.model.attributes));
    }
    if (this.model.get('active')) {
      this.$el.addClass('active');
    } else {
      this.$el.removeClass('active');
    }
    return this;
  }
}

class NavItemList extends Backbone.Collection {
  initialize(models, options) {
    this.model = NavItem;
    super.initialize(models, options);
  }
}


class Navigation extends Backbone.View {
  initialize(options) {
    super.initialize(options);
    if (userManager.isLoggedIn()) {
      this.setToUser();
    } else {
      this.setToPublic();
    }
    this.listenTo(events, 'login', this.login);
    this.listenTo(events, 'logout', this.logout);
  }
  setToPublic() {
    this.collection = new NavItemList([
      {title: 'Browse Perches', id: 'browse'},
      {title: 'Log In / Sign Up', id: 'login'}
    ]);
  }
  setToUser() {
    this.collection = new NavItemList([
      {title: 'Browse Perches', id: 'browse'},
      {title: 'Create a Perch', id: 'createPerch'},
      {title: userManager.username, id: 'home'},
      {title: 'Log Out', id: 'logout'}
    ]);
  }
  login() {
    this.setToUser();
    this.render();
  }
  logout() {
    this.setToPublic();
    this.render();
  }
  events() {
    return {
      'click #home': 'navHome'
    };
  }
  navHome(e) {
    e.preventDefault();
    Backbone.history.navigate('home', {trigger: true});
    window.scrollTo(0, 0);
  }
  render() {
    this.$el.html(navigationTemplate());
    let $topNav = this.$el.find('#top-nav');
    let $mobileNav = this.$el.find('#mobile-nav');
    this.collection.forEach((model) => {
      $topNav.append(new NavItemView({model: model}).render('top').el);
      $mobileNav.append(new NavItemView({model: model}).render('mobile').el);
    });
    return this;
  }
}

// <li><a class="waves-effect waves-light yellow-text text-accent-3" href="#">Browse Perches</a></li>
// {{#if username}}
//   <li><a class="waves-effect waves-light yellow-text text-accent-3" href="#">View Bookings</a></li>
//   <li><a class="waves-effect waves-light yellow-text text-accent-3" href="#">{{username}}</a></li>
// {{else}}
//   <li><a class="waves-effect waves-light yellow-text text-accent-3 login" href="#">Log In / Sign Up</a></li>
// {{/if}}

// <li><a class="waves-effect waves-yellow grey-text text-darken-2" href="#">Browse Perches</a></li>
// {{#if username}}
//   <li><a class="waves-effect waves-yellow grey-text text-darken-2" href="#">View Bookings</a></li>
//   <li><a class="waves-effect waves-yellow grey-text text-darken-2" href="#">{{username}}</a></li>
// {{else}}
//   <li><a class="waves-effect waves-yellow grey-text text-darken-2 login" href="#">Log In / Sign Up</a></li>
// {{/if}}


module.exports = Navigation;
