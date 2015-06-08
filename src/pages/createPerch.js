let Backbone = require('backbone');

let userManager = require('./../components/user'),
    perchManager = require('./../components/perches').perchManager;

let createPerchTemplate = require('./../templates/pages/createPerch.hbs');

class CreatePerchView extends Backbone.View {
  initialize(options) {
    super.initialize(options);
    this.perchPattern = new RegExp(/^[A-Za-z0-9 ,\.\-#&\']+$/);
    this.goodPerchName = false;
    this.goodPerchAddress = false;
  }
  events() {
    return {
      'blur #perch-name': 'checkName',
      'blur #perch-address': 'checkAddress',
      'click #create-perch-submit': 'submitPerch'
    };
  }
  checkName(e) {
    let $input = $(e.currentTarget);
    if (this.perchPattern.test($input.val())) {
      this.goodPerchName = true;
      $input.removeClass('invalid');
      $input.addClass('valid');
    } else {
      this.goodPerchName = false;
      $input.removeClass('valid');
      $input.addClass('invalid');
      Materialize.toast('Name has prohibited characters or format', 4000, 'error-toast');
    }
  }
  checkAddress(e) {
    let $input = $(e.currentTarget);
    if (this.perchPattern.test($input.val())) {
      this.goodPerchAddress = true;
      $input.removeClass('invalid');
      $input.addClass('valid');
    } else {
      this.goodPerchAddress = false;
      $input.removeClass('valid');
      $input.addClass('invalid');
      Materialize.toast('Address has prohibited characters or format', 4000, 'error-toast');
    }
  }
  submitPerch(e) {
    e.preventDefault();
    if (!this.goodPerchName) {
      Materialize.toast('Valid name is required', 4000, 'error-toast');
    }
    if (!this.goodPerchAddress) {
      Materialize.toast('Valid address is required', 4000, 'error-toast');
    }
    if (this.goodPerchName && this.goodPerchAddress) {
      let name = this.$el.find('#perch-name').val();
      let password = this.$el.find('#perch-address').val();
      perchManager.createPerch(name, password).then((response) => {
        if (response.id) {
          Backbone.history.navigate(`perchAdmin/${response.id}`, {trigger: true});
        } else {
          Materialize.toast('Creation failed. Please try again.', 4000, 'error-toast');
        }
      });
    }
  }
  render() {
    this.$el.html(createPerchTemplate());
    return this;
  }
}

module.exports = CreatePerchView;
