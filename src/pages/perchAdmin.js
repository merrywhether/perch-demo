let Backbone = require('backbone');

let userManager = require('./../components/user'),
    perchManager = require('./../components/perches').perchManager;

let perchAdminTemplate = require('./../templates/admin/perchAdmin.hbs'),
    availableListTemplate = require('./../templates/admin/availableList.hbs'),
    noAvailableTemplate = require('./../templates/admin/noAvailable.hbs'),
    availDateTemplate = require('./../templates/admin/availDate.hbs'),
    bookedListTemplate = require('./../templates/admin/bookedList.hbs'),
    noBookedTemplate = require('./../templates/admin/noBooked.hbs'),
    bookedDateTemplate = require('./../templates/admin/bookedDate.hbs');


class AvailDateView extends Backbone.View {
  tagName() {return 'li';}
  className() {return 'collection-item';}
  events() {
    return {
      'click a': 'deleteAvail'
    };
  }
  deleteAvail(e) {
    e.preventDefault();
    perchManager.deleteAvailability(this.model.get('perchId'), this.model.get('date'));
  }
  render() {
    this.$el.html(availDateTemplate(this.model.attributes));
    return this;
  }
}

class BookedDateView extends Backbone.View {
  tagName() {return 'li';}
  className() {return 'collection-item';}
  render() {
    this.$el.html(bookedDateTemplate(this.model.attributes));
    return this;
  }
}

class AvailableListView extends Backbone.View {
  viewWillLoad(collection) {
    if (this.collection) {
      this.stopListening(this.collection);
    }
    this.collection = collection;
    this.listenTo(this.collection, 'update', this.render);
  }
  render() {
    if (this.collection.length) {
      this.$el.html(availableListTemplate());
      let $list = this.$el.find('#availList');
      this.collection.forEach((date) => {
        $list.append(new AvailDateView({model: date}).render().el);
      });
    } else {
      this.$el.html(noAvailableTemplate());
    }
    return this;
  }
}

class BookedListView extends Backbone.View {
  viewWillLoad(collection) {
    if (this.collection) {
      this.stopListening(this.collection);
    }
    this.collection = collection;
    this.listenTo(this.collection, 'update', this.render);
  }
  render() {
    if (this.collection.length) {
      this.$el.html(bookedListTemplate());
      let $list = this.$el.find('#bookedList');
      this.collection.forEach((date) => {
        $list.append(new BookedDateView({model: date}).render().el);
      });
    } else {
      this.$el.html(noBookedTemplate());
    }
    return this;
  }
}

class PerchAdminView extends Backbone.View {
  initialize(options) {
    super.initialize(options);
    this.availableView = new AvailableListView();
    this.bookedView = new BookedListView();
  }
  viewWillLoad(id) {
    if (this.model) {
      this.stopListening(this.model);
      this.model = null;
    }
    this.modelPromise = perchManager.getAdminInfo(id);
  }
  events() {
    return {
      'click #submitDate': 'addDate'
    };
  }
  addDate(e) {
    e.preventDefault();
    let date = this.$el.find('#pickDate').val();
    if (date) {
      let niceDate = new Date(date).toISOString().split('T')[0];
      perchManager.addAvailability(this.model.id, niceDate).then((response) => {
        if (!response.added) {
          Materialize.toast('Duplicate date not added', 4000, 'error-toast');
        }
      });
    } else {
      Materialize.toast('Select a date first', 4000, 'error-toast');
    }
  }
  render() {
    this.modelPromise.then((model) => {
      if (model) {
        this.model = model;
        this.availableView.viewWillLoad(model.get('availDates'));
        this.bookedView.viewWillLoad(model.get('bookDates'));
        this.$el.html(perchAdminTemplate(model.attributes));
        this.$el.find('#availInfo').append(this.availableView.render().el);
        this.$el.find('#bookedInfo').append(this.bookedView.render().el);
        $('.datepicker').pickadate({
          selectMonths: true,
          selectYears: 1
        });
      } else {
        Backbone.history.navigate('home', {trigger: true});
      }
    });
    return this;
  }
}

module.exports = PerchAdminView;
