let Backbone = require('backbone');

let perchManager = require('./../components/perches').perchManager;

let homeTemplate = require('./../templates/home/home.hbs'),
    bookingsTemplate = require('./../templates/home/bookings.hbs'),
    perchesTemplate = require('./../templates/home/perches.hbs'),
    bookingRowTemplate = require('./../templates/home/bookingRow.hbs'),
    perchCardTemplate = require('./../templates/home/perchCard.hbs'),
    noBookingsTemplate = require('./../templates/home/noBookings.hbs');


class PerchCard extends Backbone.View {
  className() { return 'col s12 m6';}
  events() {
    return {
      'click a': 'viewDetails'
    };
  }
  viewDetails(e) {
    e.preventDefault();
    Backbone.history.navigate(`perchAdmin/${this.model.id}`, {trigger: true});
  }
  render() {
    this.$el.html(perchCardTemplate(this.model.attributes));
    return this;
  }
}


class PerchesView extends Backbone.View {
  render() {
    this.$el.html(perchesTemplate());
    let $list = this.$el.find('#perchList');
    this.collection.forEach((perch) => {
      $list.append(new PerchCard({model: perch}).render().el);
    });
    return this;
  }
}

class BookingRow extends Backbone.View {
  tagName() { return 'tr'; }
  events() {
    return {
      'click a': 'cancelBooking'
    };
  }
  cancelBooking(e) {
    e.preventDefault();
    perchManager.cancelBooking(this.model.get('perchId'), this.model.get('date'));
  }
  render() {
    this.$el.html(bookingRowTemplate(this.model.attributes));
    return this;
  }
}

class BookingsView extends Backbone.View {
  initialize(options) {
    super.initialize(options);
    this.listenTo(this.collection, 'update', this.render);
  }
  render() {
    this.$el.html(bookingsTemplate());
    let $tbody = this.$el.find('tbody');
    if (this.collection.length > 0) {
      this.collection.forEach((booking) => {
        $tbody.append(new BookingRow({model: booking}).render().el);
      });
    } else {
      $tbody.append(noBookingsTemplate());
    }
    return this;
  }
}

class HomeView extends Backbone.View {
  viewWillLoad() {
    this.bookingPromise = perchManager.getUserBookings();
    this.perchPromise = perchManager.getOwnerInfo();
  }
  render() {
    this.$el.html(homeTemplate());
    this.bookingPromise.then((response) => {
      this.$el.find('#bookings').append(new BookingsView({collection: perchManager.userBookings}).render().el);
    });
    this.perchPromise.then((response) => {
      this.$el.find('#perches').append(new PerchesView({collection: perchManager.userPerches}).render().el);
    });
    $('ul.tabs').tabs();
    return this;
  }
}

module.exports = HomeView;
