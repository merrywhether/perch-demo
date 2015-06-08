let init = (Handlebars) => {
  Handlebars.registerHelper('formatDate', (date) => {
    return new Date(date).toUTCString().split(' 00')[0];
  });

  Handlebars.registerHelper('count', (list) => {
    return list.length;
  });
}

module.exports = init;
