var config = require('../../server/config.json');
var path = require('path');

module.exports = (server) => {
  console.log('setting after remote for user');
  const user = server.models.User;
  user.afterRemote('create', function (context, userInstance, next) {
    console.log('> user.afterRemote triggered');

    const options = {
      type: 'email',
      to: userInstance.email,
      from: 'marvin@marvinirwin.com',
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: user
    };

    userInstance.verify(options, function (err, response, next) {
      if (err) return next(err);

      console.log('> verification email sent:', response);

      context.res.render('response', {
        title: 'Signed up successfully',
        content: 'Please check your email and click on the verification link ' -
        'before logging in.',
        redirectTo: '/',
        redirectToLinkText: 'Log in'
      });
    });
  });
};
