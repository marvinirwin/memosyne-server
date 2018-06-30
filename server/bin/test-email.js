const path = require('path');
const app = require(path.resolve(__dirname, '../../server/server'));
app.start();
(async () => {
  const user = app.models.User;
  // Really this is all I should need to see an email
  await user.destroyAll({where: {email: "mrunderhill.bree@gmail.com"}});
  const userInstance = await user.create({"email": "mrunderhill.bree@gmail.com", "password": "foo"});
  const options = {
    type: 'email',
    to: userInstance.email,
    from: 'mrunderhill.bree@gmail.com',
    subject: 'Thanks for registering.',
    template: path.resolve(__dirname, '../../server/views/verify.ejs'),
    redirect: '/verified',
    user: user
  };

  userInstance.verify(options, function (err, response, next) {
    if (err) {
      console.log(err);
      return;
    }

    console.log('> verification email sent:', response);

    context.res.render('response', {
      title: 'Signed up successfully',
      content: 'Please check your email and click on the verification link ' -
      'before logging in.',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });
})();

