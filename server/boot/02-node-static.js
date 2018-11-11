const path = require('path');
const dot = require("dot");

const _ = require('lodash');
const showdown = require('showdown');
const converter = new showdown.Converter();
converter.setOption('tables', true);
const siblingQuery = `
    SELECT sibling.*
    FROM v_edge parent_to_child
    JOIN v_node parent ON (parent_to_child.n1 = parent.id)
    JOIN v_edge parent_to_siblings ON (parent.id = parent_to_siblings.n1)
    JOIN v_node sibling ON (sibling.id = parent_to_siblings.n2)
    WHERE parent_to_child.n2 = $1 AND sibling.visible = TRUE;
`;
const parentQuery = `
    SELECT parent.*
    FROM v_edge parent_to_child
    JOIN v_node parent ON (parent_to_child.n1 = parent.id)
    WHERE parent_to_child.n2 = $1 AND parent.visible = TRUE;
`;
const childQuery = `
    SELECT  child.*
    FROM v_edge parent_to_child
    JOIN v_node child ON (parent_to_child.n2 = child.id)
    WHERE parent_to_child.n1 = $1 AND child.visible = TRUE;
`;
const rootNodesQuery = `
SELECT n.*
FROM v_nested_sets_graph g
JOIN v_node n ON (g.node_id = n.id)
WHERE g.user_id = $1 AND g.lft = 1 AND g.visible = TRUE AND n.text IS NOT NULL;
`;

const originalDots = dot.process({path: path.resolve(__dirname, '../views')});
const production = !!process.env.PRODUCTION;

function getDotNodeTemplate() {}

if (production) {
    getDotNodeTemplate = function (o) {
        return originalDots.node(o);
    }
} else {
    getDotNodeTemplate = function (o) {
        const dots = dot.process({path: path.resolve(__dirname, '../views')});
        return dots.node(o);
    }
}

function getDotNodeTemplate(o) {
}

function camelCaseObject(o) {
    Object.keys(o).map(k => {
        const camel = _.camelCase(k);
        if (camel !== k) {
            o[camel] = o[k];
            delete o[k];
        }
    });
    return o;
}

function generateMarkdown(o) {
    if (o.data) {
        o.text = o.data.text || '';
        o.userId = o.data.userId;
    } else {
        o.text = o.text || '';
    }
    o.markdown = converter.makeHtml(o.text);
    o.sanitizedText = o.text.replace(/#/g, '');
    o.summary = o.sanitizedText.split('\n')[0];
    o.markdownSummary = converter.makeHtml(o.summary);
    o.url = '/static/' + o.id;
    return o
}

function exec(datasource, query, params) {
    return new Promise((resolve, reject) => {
        try {
            datasource.connector.execute(query, params, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.map(camelCaseObject).map(generateMarkdown));
                }
            })
        } catch (e) {
            throw e;
        }
    });
}

module.exports = (server) => {
    // How do I make it so that you can only call this with /api/nodes/{number}?
    // anyways let's just assume we have permission to see everybody
    const vGraphModel = server.models.VNestedSetsGraph;
    const vNodeModel = server.models.VNode;
    const datasource = server.datasources.aws;
    if (![vGraphModel, vNodeModel, datasource].every(v => v)) {
        throw 'Not everything found undefined in node-static';
    }

    vGraphModel.static = async (nodeId) => {
        if (!nodeId) {
            const r = await vNodeModel.find({where: {text: {neq: ''}}, limit: 1});
            nodeId = r[0].id;
        }
        // First select all graph roots which belong to that user with their nodes
        // We'll use that for the side bar
        try {
            const node = await vNodeModel.findById(nodeId);
            camelCaseObject(node);
            generateMarkdown(node);
            // Graphs may not have a userId, I may have to use vGraph
            const userRootNodes = await exec(datasource, rootNodesQuery, [node.userId]);
            const siblingNodes = await exec(datasource, siblingQuery, [nodeId]);
            const parentNodes = await exec(datasource, parentQuery, [nodeId]);
            const childNodes = await exec(datasource, childQuery, [nodeId]);
            const result = getDotNodeTemplate(({
                homeLink: '/#/',
                staticLink: '/static/1',
                node,
                userRootNodes,
                siblingNodes,
                parentNodes,
                childNodes
            }));

            return result;
        } catch (e) {
            console.log(e);
        }
    };


    server.get('/static/:nodeId', async function (req, res) {
        const nodeId = req.params.nodeId;
        const response = await vGraphModel.static(nodeId);
        res.send(response);
    });
};
