let Backbone = require('backbone');

let userManager = require('./../components/user');

let loginViewTemplate = require('./../templates/pages/login.hbs');

class LoginView extends Backbone.View {
  initialize(options) {
    super.initialize(options);
    this.usernamePattern = new RegExp(/^[A-Za-z0-9\._\-]{4,50}$/);
    this.goodSignupUsername = false;
    this.goodLoginUsername = false;
    this.emailPattern = new RegExp(/^[A-Za-z0-9\.!#\$%&\'\*\+\-\/=\?\^_`\{\}|~]+@[A-Za-z0-9\-\.]+\.[A-Za-z]{2,15}$/);
    this.goodSignupEmail = false;
    this.passwordPattern = new RegExp(/^[A-Za-z0-9!@#\$%\^&\*\(\)]{8,50}$/);
    this.goodSignupPassword = false;
    this.goodLoginPassword = false;
  }
  events() {
    return {
      'blur #signup-username': 'checkUsername',
      'blur #signup-email': 'checkEmail',
      'blur #signup-password1': 'checkPasswords',
      'blur #signup-password2': 'checkPasswords',
      'click #signup-submit': 'submitSignup',
      'blur #login-username': 'validUsername',
      'blur #login-password': 'validPassword',
      'click #login-submit': 'submitLogin'
    };
  }
  validUsername(e) {
    let $input = $(e.currentTarget);
    let username = $input.val();
    if (!this.usernamePattern.test(username) && !this.emailPattern.test(username)) {
      this.goodLoginUsername = false;
      $input.removeClass('valid');
      $input.addClass('invalid');
      Materialize.toast('Username/email has prohibited characters or format', 4000, 'error-toast');
    } else {
      this.goodLoginUsername = true;
      $input.removeClass('invalid');
      $input.addClass('valid');
    }
  }
  validPassword(e) {
    let $input = $(e.currentTarget);
    if (!this.passwordPattern.test($input.val())) {
      this.goodLoginPassword = false;
      $input.removeClass('valid');
      $input.addClass('invalid');
      Materialize.toast('Password has prohibited characters or format', 4000, 'error-toast');
    } else {
      this.goodLoginPassword = true;
      $input.removeClass('invalid');
      $input.addClass('valid');
    }
  }
  submitLogin(e) {
    e.preventDefault();
    if (!this.goodLoginUsername) {
      Materialize.toast('Valid username/email is required', 4000, 'error-toast');
    }
    if (!this.goodLoginPassword) {
      Materialize.toast('Valid password is required', 4000, 'error-toast');
    }
    if (this.goodLoginUsername && this.goodLoginPassword) {
      let username = this.$el.find('#login-username').val();
      let password = this.$el.find('#login-password').val();
      userManager.login(username, password).then((response) => {
        if (response.login) {
          this.$el.find('#login-password').val('');
          Backbone.history.navigate('home', {trigger: true});
        } else {
          Materialize.toast('Login failed. Please try again.', 4000, 'error-toast');
        }
      });
    }
  }
  checkUsername(e) {
    let $input = $(e.currentTarget);
    let name = $input.val();
    if (!this.usernamePattern.test(name)) {
      Materialize.toast('Username has prohibited characters or format', 4000, 'error-toast');
      this.goodSignupUsername = false;
      $input.removeClass('valid');
      $input.addClass('invalid');
    } else {
      $.ajax('auth.php', {
        method: 'GET',
        dataType: 'json',
        data: {
          action: 'checkValue',
          username: name
        },
        success: (response) => {
          if (response.available) {
            this.goodSignupUsername = true;
            $input.removeClass('invalid');
            $input.addClass('valid');
          } else {
            if (response.available == false) {
              Materialize.toast('Username is already taken', 4000, 'error-toast');
            } else if (response.invalid) {
              Materialize.toast('Username has prohibited characters or format', 4000, 'error-toast');
            }
            $input.removeClass('valid');
            $input.addClass('invalid');
            this.goodSignupUsername = false;
          }
        },
        error: (response) => console.log(response)
      });
    }
  }
  checkEmail(e) {
    let $input = $(e.currentTarget);
    let email = $input.val();
    if (!this.emailPattern.test(email)) {
      Materialize.toast('Email has prohibited characters or format', 4000, 'error-toast');
      this.goodSignupEmail = false;
      $input.removeClass('valid');
      $input.addClass('invalid');
    } else {
      $.ajax('auth.php', {
        method: 'GET',
        dataType: 'json',
        data: {
          action: 'checkValue',
          email: email
        },
        success: (response) => {
          if (response.available) {
            this.goodSignupEmail = true;
            $input.removeClass('invalid');
            $input.addClass('valid');
          } else {
            if (response.available == false) {
              Materialize.toast('Email is already taken', 4000, 'error-toast');
            } else if (response.invalid) {
              Materialize.toast('Email has prohibited characters or format', 4000, 'error-toast');
            }
            $input.removeClass('valid');
            $input.addClass('invalid');
            this.goodSignupEmail = false;
          }
        },
        error: (response) => console.log(response)
      });
    }
  }
  checkPasswords(e) {
    let $password1 = this.$el.find('#signup-password1');
    let password1 = $password1.val();
    let $password2 = this.$el.find('#signup-password2');
    let password2 = $password2.val();
    if (password1 && password2) {
      //both passwords have been entered
      if (this.passwordPattern.test(password1) && this.passwordPattern.test(password2)) {
        //if both are proper pattern
        if (password1 === password2) {
          //both match and are right pattern
          this.goodSignupPassword = true;
          $password1.removeClass('invalid');
          $password1.addClass('valid');
          $password2.removeClass('invalid');
          $password2.addClass('valid');
        } else {
          //good patterns, but don't match
          this.goodSignupPassword = false;
          $password1.removeClass('valid');
          $password1.addClass('invalid');
          $password2.removeClass('valid');
          $password2.addClass('invalid');
          Materialize.toast('Passwords must match', 4000, 'error-toast');
        }
      } else {
        //one of the passwords has a bad pattern
        this.goodSignupPassword = false;
        $password1.removeClass('valid');
        $password1.addClass('invalid');
        $password2.removeClass('valid');
        $password2.addClass('invalid');
        Materialize.toast('Password has prohibited characters or format', 4000, 'error-toast');
      }
    } else {
      //only 1 password has been entered
      let $input = $(e.currentTarget);
      let password = $input.val();
      if (!this.passwordPattern.test(password)) {
        this.goodSignupPassword = false;
        $input.removeClass('valid');
        $input.addClass('invalid');
        Materialize.toast('Password has prohibited characters or format', 4000, 'error-toast');
      } else {
        $input.removeClass('invalid');
        $input.addClass('valid');
      }
    }
  }
  submitSignup(e) {
    e.preventDefault();
    if (!this.goodSignupUsername) {
      Materialize.toast('Valid username is required', 4000, 'error-toast');
    }
    if (!this.goodSignupEmail) {
      Materialize.toast('Valid email is required', 4000, 'error-toast');
    }
    if (!this.goodSignupPassword) {
      Materialize.toast('Valid password is required', 4000, 'error-toast');
    }
    if (this.goodSignupUsername && this.goodSignupEmail && this.goodSignupPassword) {
      let username = this.$el.find('#signup-username').val();
      let email = this.$el.find('#signup-email').val();
      let password1 = this.$el.find('#signup-password1').val();
      let password2 = this.$el.find('#signup-password2').val();
      userManager.createUser(username, email, password1, password2).then((response) => {
        if (response.created) {
          this.$el.find('#signup-password1').val('');
          this.$el.find('#signup-password2').val('');
          Backbone.history.navigate('home', {trigger: true});
        } else {
          Materialize.toast('Something went wrong. Please try again.', 4000, 'error-toast');
        }
      });
    }
  }
  render() {
    this.$el.html(loginViewTemplate());
    $('ul.tabs').tabs();
    $('.tooltipped').tooltip({delay: 50});
    return this;
  }
};

module.exports = LoginView;
