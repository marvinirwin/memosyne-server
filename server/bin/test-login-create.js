const path = require('path');
const axios = require('axios');
const app = require(path.resolve(__dirname, '../../server/server'));
const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;

app.start();

(async () => {
  const user = app.models.User;
  const result = await user.login({"email": email, "password": password});
  const token = result.id;
  console.log(token);
  const node = await axios.post('http://localhost:3000/api/Nodes', {}, {params: {access_token: token}});
  const nodeRevision = await axios.post('http://localhost:3000/api/NodeRevisions',
    {text: 'test1', nodeId: node.data.id}, {params: {access_token: token}});
  console.log(node.data);
  console.log(nodeRevision.data);
})();
