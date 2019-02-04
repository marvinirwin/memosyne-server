'use strict';
const path = require('path');
const fs = require('fs');
const app = require(path.resolve(__dirname, '../../server/server'));
const destDirectory = path.resolve(__dirname, '../../common/models');

const dataSource = app.dataSources.aws;
const defaultACLs = [
      {
          accessType: '*',
          principalType: 'ROLE',
          principalId: '$everyone',
          permission: 'DENY',
      },
      {
          accessType: 'READ',
          principalType: 'ROLE',
          principalId: '$everyone',
          permission: 'ALLOW',
      },
];

function sanitizeModel(model) {
  for (let prop in model.properties) {
    let v = model.properties[prop];
    if (v.postgresql.dataType === 'timestamp with time zone') {
      v.type = 'Date';
    }
    if (v.postgresql.dataType === 'float') {
      v.type = 'Number';
    }
    if (v.postgresql.dataType === 'smallint') {
      v.type = 'Boolean';
    }
    if (prop === 'id') {
      v.id = 1;
      v.required = false;
    }
    if (v.required) {
      delete v.required;
    }
  }
}

function schemaCB(err, model) {
  if (err) {
    console.log(err);
    return;
  }
  sanitizeModel(model);
  model.acls = defaultACLs;
  let outputName = destDirectory + '/' + model.name + '.json';
  // If there is already a model there, load its things
  try {
    const presentModel = require(outputName);
    if (presentModel) {
      model.validations = presentModel.validations;
      model.relations = presentModel.relations;
      model.acls = presentModel.acls;
      model.methods = presentModel.methods;
      model.name = presentModel.name;
    }
  } catch (e) {
    console.log(e);
    console.log('Original model probably not found');
  }

  fs.writeFile(outputName, JSON.stringify(model, null, 2), function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('JSON saved to ' + outputName);
    }
  });
}

function discoverTable(tableName) {
  dataSource.discoverSchema(tableName, {schema: 'public'}, schemaCB);
}

const tables = [
  "node",
  "edge",
  "node_revision",
  "edge_revision",
  "v_node",
  "v_edge",
  "v_node_revision",
  "v_edge_revision",
  'nested_sets_graph',
  'v_nested_sets_graph',
    'v_nested_sets_graph_source_node',
];

tables.map(discoverTable);


