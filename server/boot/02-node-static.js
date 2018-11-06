const path = require('path');
const dots = require("dot").process({path: path.resolve(__dirname, '../views')});

module.exports = (server) => {
  return;
  // How do I make it so that you can only call this with /api/nodes/{number}?
  // anyways let's just assume we have permission to see everybody
  const graph = server.models.VNestedSetsGraph;
  const user = server.models.User;
  if (!graph) {
    throw 'Graph undefined in node-static';
  }

  graph.static = async (id) => {
    // first select all graph roots which belong to that user with their nodes
    // We'll use that for the side bar
    const rootVNodes = await user.__nestedSetsGraphs__VNodes(id);
    // Now grab all that graph's vNode
    const parent = await graph.__VNode(id);
    // Now grab all that node's immediate children
    // Maybe have to make a relation VNode -> OutoingVEdge -> IncomingVEdge.  Maybe we need their children?
    const immediateChildren = await graph.__VNode__OutgoingVEdges__VNode(id);

  };

  // So to load a node's static we need to query all that node's nestedSset
  nodes.static = (id) => {

  };
  app.get('/static', async function(req, res){
    // TODO figure out how to render my dots template into a request
    const result = dots.node({parent:{text:'icecream'}});
    console.log(result);
  });
};
