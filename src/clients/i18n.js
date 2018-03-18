const i18n = require('i18n');
const config = require('config');

i18n.configure({
  //locales: ['en'],
  locales: config.get('locales'),
  //cookie: 'language',
  updateFiles: false,
  objectNotation: true,
  directory: __dirname + '/../../locales'
});

module.exports = i18n
