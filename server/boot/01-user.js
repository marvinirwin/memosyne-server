const config = require('../../server/config.json');
const path = require('path');


module.exports = (app) => {
    const user = app.models.User;
    const defaultUser = app.models.DefaultUser;
    const node = app.models.Node;
    const vNode = app.models.VNode;
    const vEdge = app.models.VEdge;
    const nodeRevision = app.models.NodeRevision;
    const edge = app.models.Edge;
    const edgeRevision = app.models.EdgeRevision;
    const nestedSetsGraph = app.models.NestedSetsGraph;
    const vNestedSetsGraph = app.models.VNestedSetsGraph;

    app.broadcastNodeRevision = async ({result}) => {
        const text = JSON.stringify({
            nodeId: result.nodeId,
            text: result.text,
            messageType: 'NODE_REVISION_CREATE'
        });
        console.log(`Active websockets: ${app.activeSockets.length}, text length: ${text.length}`);
        app.activeSockets.forEach(ws => {
            ws.send(text)
        });
    };
    app.broadcastEdgeRevision = async ({result}) => {
        const text = JSON.stringify({
            previousEdges: await edgeRevision.find({
                where: {edgeId: result.edgeId},
                orderBy: ['createdTimestamp DESC'],
                limit: 1,
                skip: 1
            },),
            n1: result.n1,
            n2: result.n2,
            messageType: 'EDGE_REVISION_CREATE'
        });
        console.log(`Active websockets: ${app.activeSockets.length}, text length: ${text.length}`);
        app.activeSockets.forEach(ws => {
            ws.send(text)
        });
    };
    nodeRevision.afterRemote('create', ({result}) => server.broadcastNodeRevision({result}));
    edgeRevision.afterRemote('create', ({result}) => server.broadcastEdgeRevision({result}));


    const createNodeRevision = async (ctx) => {
        // Will I get the entire object back, or do I have to re-query it?
        const revisionResult = await app.models.NodeRevision.create({nodeId: ctx.result.id});
        const revision = await app.models.NodeRevision.findById(revisionResult.id);
        // TODO The request that this replies to does not receive nodeRevisions, why not?
        ctx.result.nodeRevisions = [revision];
    };
    const addUser = async (ctx) => {
        ctx.req.body.userId = /*ctx.req.accessToken.userId;*/ 24;
    };
    node.afterRemote('create', createNodeRevision);
    node.beforeRemote('create', addUser);
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
    defaultUser.hasMany(vNestedSetsGraph, {
        foreignKey: 'userId',
    });
    user.hasMany(vNestedSetsGraph, {});
    user.hasMany(node, {});
    user.hasMany(vNode, {});
    user.hasMany(edge, {});
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

    // I don't remember when I made this,
    // but I would think that I have to add nestRemoting to defaultUser, but I guess not?


    // !!!! Be careful when you do this, plurals matter in relations
    user.nestRemoting('nodes');
    user.nestRemoting('vNodes');
    user.nestRemoting('edges');
    user.nestRemoting('vNestedSetsGraphs');
    node.nestRemoting('nodeRevisions');
    vNode.nestRemoting('nodeRevisions');
    edge.nestRemoting('edgeRevisions');
    vNestedSetsGraph.nestRemoting('vNode');
};


/*  user.afterRemote('create', function (context, userInstance, next) {
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
  });*/

