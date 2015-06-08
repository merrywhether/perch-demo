let $ = require('jquery'),
    Backbone = require('backbone');

let events = require('./events');

class UserManager {
  initialize(options) {
    this.userId = localStorage.getItem('userId');
    this.username = localStorage.getItem('username');
    this.token = localStorage.getItem('token');
    if (this.userId && this.token && this.username) {
      $.ajax('auth.php', {
        method: 'POST',
        dataType: 'json',
        data: {
          action: 'checkAuth',
          user: this.userId,
          token: this.token
        },
        success: (response) => {
          if (!response.valid) {
            this.resetData();
            Materialize.toast('Authorization from last login has expired.', 4000, 'error-toast');
            Backbone.history.navigate('login', {trigger: true});
          } else {
            console.log('Last login still valid');
          }
        },
        error: (response) => {
          console.log(response);
        }
      });
    } else {
      this.resetData();
    }
  }
  isLoggedIn() {
    return (this.userId && this.token && this.username);
  }
  logout() {
    let logoutPromise = new Promise((resolve, reject) => {
      $.ajax('auth.php', {
        method: 'POST',
        dataType: 'json',
        data: {
          action: 'logout',
          id: this.userId,
          token: this.token
        },
        success: (response) => {
          if (response.logout) {
            this.resetData();
            this.triggerLogout();
            resolve({logout: true});
          } else {
            resolve({logout: false});
          }
        },
        error: (response) => {
          console.log(response);
          reject('error');
        }
      });
    });
    return logoutPromise;
  }
  login(username, password) {
    let loginPromise = new Promise((resolve, reject) => {
      $.ajax('auth.php', {
        method: 'POST',
        dataType: 'json',
        data: {
          action: 'login',
          username: username,
          password: password
        },
        success: (response) => {
          if (response.id && response.username && response.token) {
            this.setUserId(response.id);
            this.setUsername(response.username);
            this.setToken(response.token);
            this.triggerLogin();
            resolve({login: true});
          } else {
            resolve({login: false});
          }
        },
        error: (response) => {
          console.log(response);
          reject('error');
        }
      });
    });
    return loginPromise;
  }
  createUser(username, email, password1, password2) {
    let createPromise = new Promise((resolve, reject) => {
      $.ajax('auth.php', {
        method: 'POST',
        dataType: 'json',
        data: {
          action: 'create',
          username: username,
          email: email,
          password1: password1,
          password2: password2
        },
        success: (response) => {
          if (response.id && response.username && response.token) {
            this.setUserId(response.id);
            this.setUsername(response.username);
            this.setToken(response.token);
            this.triggerLogin();
            resolve({created: true});
          } else {
            resolve({created: false});
          }
        },
        error: (response) => {
          console.log(response);
          reject('error');
        }
      });
    });
    return createPromise;
  }
  resetData() {
    this.userId = null;
    this.username = null;
    this.token = null;
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
  }
  setUserId(id) {
    this.userId = id;
    localStorage.setItem('userId', id);
  }
  setUsername(username) {
    this.username = username;
    localStorage.setItem('username', username);
  }
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }
  triggerLogin() {
    events.trigger('login');
  }
  triggerLogout() {
    events.trigger('logout');
  }
}

let userManager = new UserManager();

module.exports = userManager;
