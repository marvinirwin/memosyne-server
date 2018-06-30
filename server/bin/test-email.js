const path = require('path');
const app = require(path.resolve(__dirname, '../../server/server'));
const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;
app.start();
function sleep(n) {
  return new Promise((resolve) => {
    setTimeout(resolve, n);
  })
}

(async () => {
  const user = app.models.User;
  // Really this is all I should need to see an email
  await user.destroyAll({where: {email: email}});
  const userInstance = await user.create({"email": email, "password": password});
})();

