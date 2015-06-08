let $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone');

let events = require('./events'),
    userManager = require('./user');

class Date extends Backbone.Model {}

class Dates extends Backbone.Collection {
  initialize(models, options) {
    this.model = Date;
    this.comparator = 'date';
    super.initialize(models, options);
  }
}

class Perch extends Backbone.Model {}

class Perches extends Backbone.Collection {
  initialize(models, options) {
    this.model = Perch;
    this.comparator = 'name';
    super.initialize(models, options);
  }
}

class Bookings extends Backbone.Collection {
  initialize(models, options) {
    this.model = Perch;
    this.comparator = 'date';
    super.initialize(models, options);
  }
}

class PerchManager {
  initialize() {
    this.userPerches = new Perches();
    this.allPerches = new Perches();
    this.userBookings = new Bookings();
  }
  getOwnerInfo() {
    let ownerPromise = new Promise((resolve, reject) => {
      $.ajax('perches.php', {
        method: 'POST',
        dataType: 'json',
        data: {
          action: 'ownerBookings',
          user: userManager.userId,
          token: userManager.token
        },
        success: (response) => {
          if (response.perches) {
            let perchData = response.perches;
            let perches = {}
            _.each(perchData, (perch) => {
              perches[perch.id] = {
                id: perch.id,
                name: perch.name,
                address: perch.address,
                availDates: new Dates(),
                bookDates: new Dates()
              };
            });
            _.each(response.avail, (date) => {
              perches[date.id].availDates.add({date: date.availDate, perchId: date.id});
            });
            _.each(response.bookings, (date) => {
              perches[date.id].bookDates.add({date: date.bookDate, perchId: date.id});
            })
            perches = _.map(perches, (perch) => {return perch;});
            this.userPerches.reset();
            this.userPerches.add(perches);
            resolve({updated: true});
          } else {
            resolve(null);
          }
        },
        error: (response) => {
          console.log(response);
          reject('error');
        }
      });
    });
    return ownerPromise;
  }
  getUserBookings() {
    let bookingPromise = new Promise((resolve, reject) => {
      $.ajax('perches.php', {
        method: 'POST',
        dataType: 'json',
        data: {
          action: 'userBookings',
          user: userManager.userId,
          token: userManager.token
        },
        success: (response) => {
          if (response.dates) {
            this.userBookings.reset();
            this.userBookings.add(response.dates);
            resolve({updated: true});
          } else {
            resolve(null);
          }
        },
        error: (response) => {
          console.log(response);
          reject('error');
        }
      });
    });
    return bookingPromise;
  }
  getAllAvailability() {
    let availPromise = new Promise((resolve, reject) => {
      $.ajax('perches.php', {
        method: 'GET',
        dataType: 'json',
        data: {
          action: 'getAllAvail'
        },
        success: (response) => {
          if (response.dates) {
            let perchData = _.groupBy(response.dates, (perch) => {return perch.id});
            let perches = [];
            for (let k in perchData) {
              let perch = {
                id: perchData[k][0].id,
                name: perchData[k][0].name,
                address: perchData[k][0].address,
                availDates: new Dates()
              };
              _.each(perchData[k], (entry) => {
                perch.availDates.add({date: entry.date, perchId: entry.id});
              });
              perches.push(perch);
            }
            perches = _.sortBy(perches, (perch) => {return perch.name;});
            this.allPerches.reset();
            this.allPerches.add(perches);
            resolve({updated: true});
          } else {
            resolve(null);
          }
        },
        error: (response) => {
          console.log(response);
          reject('error');
        }
      });
    });
    return availPromise;
  }
  addAvailability(perchId, date) {
    let availPromise = new Promise((resolve, reject) => {
      $.ajax('perches.php', {
        method: 'POST',
        dataType: 'json',
        data: {
          action: 'addAvail',
          owner: userManager.userId,
          token: userManager.token,
          perch: perchId,
          date: date
        },
        success: (response) => {
          if (response.added) {
            let model = this.userPerches.get(perchId);
            model.get('availDates').add({perchId: perchId, date: date});
            resolve({added: true});
          } else {
            resolve({added: false});
          }
        },
        error: (response) => {
          console.log(response);
          reject('error');
        }
      });
    });
    return availPromise;
  }
  deleteAvailability(perchId, date) {
    $.ajax('perches.php', {
      method: 'POST',
      dataType: 'json',
      data: {
        action: 'deleteAvail',
        owner: userManager.userId,
        token: userManager.token,
        perch: perchId,
        date: date
      },
      success: (response) => {
        if (response.deleted) {
          let availDates = this.userPerches.get(perchId).get('availDates');
          let model = availDates.findWhere({date: date});
          availDates.remove(model);
        } else {
          Materialize.toast('Unable to remove date', 4000, 'error-toast');
        }
      },
      error: (response) => {
        console.log(response);
      }
    });
  }
  bookDate(perchId, date) {
    $.ajax('perches.php', {
      method: 'POST',
      dataType: 'json',
      data: {
        action: 'addBooking',
        user: userManager.userId,
        token: userManager.token,
        perch: perchId,
        date: date
      },
      success: (response) => {
        if (response.booked) {
          let availDates = this.allPerches.get(perchId).get('availDates');
          let model = availDates.findWhere({date: date});
          availDates.remove(model);
        } else if (response.error == 'duplicate') {
          Materialize.toast('Double bookings are not allowed yet', 4000, 'error-toast');
        } else {
          Materialize.toast('Unable to book perch', 4000, 'error-toast');
        }
      },
      error: (response) => {
        console.log(response);
      }
    });
  }
  cancelBooking(perchId, date) {
    $.ajax('perches.php', {
      method: 'POST',
      dataType: 'json',
      data: {
        action: 'cancelBooking',
        user: userManager.userId,
        token: userManager.token,
        perch: perchId,
        date: date
      },
      success: (response) => {
        if (response.cancelled) {
          let model = this.userBookings.findWhere({perchId: perchId, date: date});
          this.userBookings.remove(model);
        } else {
          Materialize.toast('Unable to cancel booking', 4000, 'error-toast');
        }
      },
      error: (response) => {
        console.log(response)
      }
    });
  }
  createPerch(name, address) {
    let perchPromise = new Promise((resolve, reject) => {
      $.ajax('perches.php', {
        method: 'POST',
        dataType: 'json',
        data: {
          action: 'createPerch',
          owner: userManager.userId,
          token: userManager.token,
          perch: name,
          address: address
        },
        success: (response) => {
          if (response.added) {
            this.userPerches.add({
              id: response.id,
              name: name,
              address: address
            });
            resolve({id: response.id});
          } else {
            resolve({added: false});
          }
        },
        error: (response) => {
          console.log(response);
          reject('error');
        }
      });
    });
    return perchPromise;
  }
  getAdminInfo(id) {
    let infoPromise = new Promise((resolve, reject) => {
      $.ajax('perches.php', {
        method: 'POST',
        dataType: 'json',
        data: {
          action: 'perchBookings',
          user: userManager.userId,
          token: userManager.token,
          perch: id
        },
        success: (response) => {
          if (response.id) {
            response.availDates = new Dates(response.availDates);
            response.bookDates = new Dates(response.bookDates);
            this.userPerches.remove(response.id);
            resolve(this.userPerches.add(response));
          } else {
            resolve(null);
          }
        },
        error: (response) => {
          console.log(response);
          reject('error');
        }
      });
    });
    return infoPromise;
  }
}

let perchManager = new PerchManager();

exports.perchManager = perchManager;
