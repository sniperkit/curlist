const PORT = process.env.PORT || 3000;
const logger = require('./src/clients/logger');
var app = require('./server');

app.listen(PORT, function () {
  logger.info('Your app listening on port %s!', PORT);
});
