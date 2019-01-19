

module.exports = (server) => {
    const node = server.models.Node;
    const vNode = server.models.VNode;
    const nodeRevision = server.models.NodeRevision;
    const edge = server.models.Edge;
    const edgeRevision = server.models.EdgeRevision;
    const nestedSetsGraph = server.models.NestedSetsGraph;
    const vNestedSetsGraph = server.models.VNestedSetsGraph;
    const user = server.models.User;
    const defaultUser = server.models.DefaultUser;
    const aws = server.datasources.aws;

    /**
     * @param rootText {string}
     * @param childrenText {string[]}
     * @param parentId {number}
     */
    user.createTree = async (rootText, childrenText=[], parentId) => {
        // TODO figure out how to get userId in here
        const rootNode = await node.create();
        await nodeRevision.create({nodeId: rootNode, text: rootText});
        if (parentId){
            const e = await edge.create();
            await edgeRevision.create({n1: parentId, n2: parent.id, edgeId: e.id});
        }
        childrenText.forEach(async (text) => {
            const n = await node.create();
            const e = await edge.create();
            await nodeRevision.create({text, nodeId: n.id});
            await edgeRevision.create({n1: parent.id, n2: n.id, edgeId: e.id});
        });
    };

    user.remoteMethod('createTree', {
      "accepts": [
        {
          "arg": "rootText",
          "type": "string",
          "required": true,
          "description": "The text for the root node"
        },
        {
          "arg": "childrenText",
          "type": "array",
          "required": false,
          "description": "Array of children to be placed under the root"
        },
        {
          "arg": "parentId",
          "type": "number",
          "required": false,
          "description": "Used to add the rootText node to an existing tree"
        }
      ],
      "returns": [],
      "description": "Given text for a root node, and an array of text for child nodes will create them",
      "http": []
    });
};