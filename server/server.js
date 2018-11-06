'use strict';
const loopback = require('loopback');
const boot = require('loopback-boot');
const path = require('path');

const app = module.exports = loopback();

const PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
const passportConfigurator = new PassportConfigurator(app);



app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

boot(app, __dirname, function (err) {
  if (err) throw err;

  if (require.main === module)
    app.start();
});

let config = {};
try {
  config = require('./providers.local.js');
} catch (err) {
  console.error('Please configure your passport strategy in `providers.json`.');
  console.error('Copy `providers.json.template` to `providers.json` and replace the clientID/clientSecret values with your own.');
  process.exit(1);
}
// Initialize passport
passportConfigurator.init();

passportConfigurator.setupModels({
  userModel: app.models.user,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential
});
for (const s in config) {
  const c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
}

