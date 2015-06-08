let Backbone = require('backbone');

let welcomeViewTemplate = require('./../templates/pages/welcome.hbs');

class WelcomeView extends Backbone.View {
  events() {
    return {
      'click .login': 'login'
    };
  }
  login(e) {
    e.preventDefault();
    Backbone.history.navigate('login', {trigger: true});
    window.scrollTo(0, 0);
  }
  render() {
    this.$el.html(welcomeViewTemplate());
    return this;
  }
}

module.exports = WelcomeView;
