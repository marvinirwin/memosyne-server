var config = require('../../server/config.json');
var path = require('path');

module.exports = (server) => {
  console.log('setting after remote for user');
  const user = server.models.User;
  const defaultUser = server.models.DefaultUser;
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
  const vNode = server.models.VNode;
  const nodeRevision = server.models.NodeRevision;
  const edge = server.models.Edge;
  const edgeRevision = server.models.EdgeRevision;
  const createNodeRevision = async ({result}) => {
    // Will I get the entire object back, or do I have to re-query it?
    const revisionResult = await server.models.NodeRevision.create({nodeId: result.id});
    const revision = await server.models.NodeRevision.findById(revisionResult.id);

    result.nodeRevisions = [revision];
  };
  const addUser = async (ctx) => {
    ctx.req.body.userId = ctx.req.accessToken.userId;
  };
  node.beforeRemote('create', addUser);
  node.afterRemote('create', createNodeRevision);
  nodeRevision.beforeRemote('create', addUser);
  edge.beforeRemote('create', addUser);
  edgeRevision.beforeRemote('create', addUser);

  defaultUser.hasMany(node, {
    foreignKey: 'userId',
  });
  defaultUser.hasMany(vNode, {
    foreignKey: 'userId',
  });
  defaultUser.hasMany(edge, {
    foreignKey: 'userId',
  });
  user.hasMany(node, {});
  user.hasMany(vNode, {});
  user.hasMany(edge, {});
  /*  // TODO How do I create this ACL?  Doesn't the model have an acl property?
    debugger;*/
// Do I need to make sure that the user is creating an node which belongs to it?
  user.settings.acls.push(
    {
      "principalType": "ROLE",
      "principalId": "$authenticated",
      "permission": "ALLOW",
      "property": "__create__nodes",
    },
    {
      "principalType": "ROLE",
      "principalId": "$authenticated",
      "permission": "ALLOW",
      "property": "",
    }
  );
  user.emit('remoteMethodAdded');

  user.nestRemoting('nodes');
  user.nestRemoting('vNodes');
  user.nestRemoting('edges');
  node.nestRemoting('nodeRevisions');
  vNode.nestRemoting('nodeRevisions');
  edge.nestRemoting('edgeRevisions');
};
