let Backbone = require('backbone');

let userManager = require('./../components/user'),
    perchManager = require('./../components/perches').perchManager;

let browseTemplate = require('./../templates/browse/browse.hbs'),
    perchTemplate = require('./../templates/browse/perch.hbs'),
    noPerchTemplate = require('./../templates/browse/noPerches.hbs'),
    availDateTemplate = require('./../templates/browse/availDate.hbs');


class AvailDateView extends Backbone.View {
  tagName() {return 'li';}
  className() {return 'collection-item';}
  events() {
    return {
      'click': 'bookDate'
    };
  }
  bookDate(e) {
    e.preventDefault();
    if (userManager.isLoggedIn()) {
      perchManager.bookDate(this.model.get('perchId'), this.model.get('date'));
    } else {
      Materialize.toast('Log in / sign up to book a Perch!', 4000, 'error-toast');
    }
  }
  render() {
    this.$el.html(availDateTemplate(this.model.attributes));
    return this;
  }
}

class PerchView extends Backbone.View {
  initialize(options) {
    super.initialize(options);
    this.listenTo(this.collection, 'update', this.render);
  }
  className() { return 'col s6'; }
  render() {
    this.$el.html(perchTemplate(this.model.attributes));
    let $list = this.$el.find('.availList');
    this.collection.forEach((date) => {
      $list.append(new AvailDateView({model: date}).render().el);
    });
    return this;
  }
}

class BrowseView extends Backbone.View {
  viewWillLoad() {
    this.infoPromise = perchManager.getAllAvailability();
  }
  render() {
    this.infoPromise.then((response) => {
      if (response.updated) {
        this.collection = perchManager.allPerches;
        this.$el.html(browseTemplate());
        let $list = this.$el.find('#perchList');
        if (this.collection.length > 0) {
          this.collection.forEach((perch) => {
            $list.append(new PerchView({model: perch, collection: perch.get('availDates')}).render().el);
          });
        } else {
          $list.append(noPerchTemplate());
        }
      }
    });
    return this;
  }
}

module.exports = BrowseView;
