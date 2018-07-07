const path = require('path');
const app = require(path.resolve(__dirname, '../../server/server'));
app.start();

(async () => {
  const user = app.models.User;
  const defaultUser = app.models.DefaultUser;

  // Now test include
  const includeUserNodes = await user.findOne(
    {
      include: [
        {
          relation: 'nodes',
          scope: {
            include: [
              {
                relation: 'nodeRevisions',
                scope: {
                  limit: 1,
                  order: ['createdTimestamp DESC'],
                },
              }
            ],
          },
        },
        {
          relation: 'edges',
          scope: {
            include: [
              {
                relation: 'edgeRevisions',
                scope: {
                  limit: 1,
                  order: ['createdTimestamp DESC']
                }
              }
            ],
          },
        },
      ],
    },
  );
  const includeDefaultUserNodes = await defaultUser.findOne(
    {
      include: [
        {
          relation: 'nodes',
          scope: {
            include: [
              {
                relation: 'nodeRevisions',
                scope: {
                  limit: 1,
                  order: ['createdTimestamp DESC'],
                },
              }
            ],
          },
        },
        {
          relation: 'edges',
          scope: {
            include: [
              {
                relation: 'edgeRevisions',
                scope: {
                  limit: 1,
                  order: ['createdTimestamp DESC']
                }
              }
            ],
          },
        },
      ],
    },
  );

  console.log('--- USER NODES --- ');
  console.log(JSON.stringify(includeUserNodes, null, '\t'));
  console.log('--- END USER NODES --- ');


  console.log('--- DEFAULT USER NODES --- ');
  console.log(JSON.stringify(includeDefaultUserNodes, null, '\t'));
  console.log('--- END DEFAULT USER NODES --- ');
})();
