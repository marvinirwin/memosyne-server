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

  const node = server.models.Node;
  const nodeRevision = server.models.NodeRevision;
  const edge = server.models.Edge;
  const edgeRevision = server.models.EdgeRevision;
  const addUser = async (ctx) => {
    ctx.req.body.userId = ctx.req.accessToken.userId;
  };
  node.beforeRemote('create', addUser);
  nodeRevision.beforeRemote('create', addUser);
  edge.beforeRemote('create', addUser);
  edgeRevision.beforeRemote('create', addUser);

  user.hasMany(node, {});
  user.hasMany(edge, {});
};
