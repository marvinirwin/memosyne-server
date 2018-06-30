const path = require('path');
const axios = require('axios');
const app = require(path.resolve(__dirname, '../../server/server'));
app.start();

(async () => {
  const user = app.models.User;
  const userInstance = await user.findOne();
  console.log(userInstance);
  const userNodes = await userInstance.nodes.find();
  console.log(userNodes);
})();
