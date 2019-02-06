module.exports = (app) => {
    const user = app.models.User;
    const defaultUser = app.models.DefaultUser;
    const nodeModel = app.models.Node;
    const vNode = app.models.VNode;
    const vEdge = app.models.VEdge;
    const nodeRevision = app.models.NodeRevision;
    const edgeModel = app.models.Edge;
    const edgeRevision = app.models.EdgeRevision;
    const nestedSetsGraph = app.models.NestedSetsGraph;
    const vNestedSetsGraph = app.models.VNestedSetsGraph;

    nodeModel.moveNode = async (n, newParentNodeId) => {
        if (n.id === newParentNodeId) {
            throw new Error('Cannot move nodeModel to be a parent of itself!');
        }
        // If we have no new parent then it becomes a root, so we must make the edgeModel useless
        const edgeToModify = (await vEdge.find({where: {n2: n.id}}))[0];
        if (!edgeToModify) {
            if (!newParentNodeId) {
                // Does this mean somebody dragged a nodeModel which was already a root nodeModel to be a root nodeModel?
                throw new Error('Node being moved is already a root nodeModel!');
            }
            const newEdge = await edgeModel.create({userId: 24});
            const newRevision = edgeRevision.create({
                edgeId: newEdge.id,
                n1: newParentNodeId,
                n2: n.id,
            });
            app.broadcastEdgeRevision({result: newRevision})
        } else {
            if (!newParentNodeId) {
                const silenceRevision = await edgeRevision.create({
                    edgeId: edgeToModify.id,
                    n1: undefined,
                    n2: undefined,
                });
                app.broadcastEdgeRevision({result: silenceRevision})
            } else {
                const changeRevision = await edgeRevision.create({
                    edgeId: edgeToModify.id,
                    n1: newParentNodeId,
                    n2: n.id,
                })
                app.broadcastEdgeRevision({result: changeRevision})
            }
        }
        // Now our tree has been recomputed, grab us again
        const set = await vNestedSetsGraph.find({where: {nodeId: n.id}});
        return set;
    };
    nodeModel.createNode = async (parentId, text) => {
        const n = await nodeModel.create({userId: 24});
        if (text) {
            await nodeRevision.create({nodeId: n.id, text});
        }
        if (parentId) {
            const e = await edgeModel.create({userId: 24});
            const er = await edgeRevision.create({edgeId: e.id, n1: parentId, n2: n.id});
        }

        return vNode.findById(n.id);
    };
    nodeModel.remoteMethod('moveNode', {
        "accepts": [
            {
                "arg": "node",
                "type": "Object",
                "required": true,
                "description": "The nodeModel which is being moved"
            },
            {
                "arg": "newParentNodeId",
                "type": "number",
                "required": true,
                "description": "The id of the new parent "
            }
        ],
        "http": {"verb": "post"},
        "returns": [],
        "description": "Will create the necessary edgeModel to move this nodeModel to the new parent",
    });
    nodeModel.remoteMethod('createNode', {
        "accepts": [
            {
                "arg": "parentId",
                "type": "number",
                "required": false,
                "description": "The id of our parent, if we have one"
            },
            {
                "arg": "text",
                "type": "string",
                "required": false,
                "description": "This will create a revision with this text if present"
            }
        ],
        "http": {"verb": "post"},
        "returns": [
            {name: "node", type: "Object"}
            ],
        "description": "Will create the necessary edgeModel to move this nodeModel to the new parent",
    });
}

