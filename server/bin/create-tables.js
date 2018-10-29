const server = require('../server');
const ds = server.dataSources.aws;
const lbTables = [
  'ApplicationCredential',
  'UserCredential',
  'UserIdentity',
];
ds.automigrate(lbTables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' + lbTables + '] created in ', ds.adapter.name);
  ds.disconnect();
});
