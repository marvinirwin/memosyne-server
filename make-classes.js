const fs = require('fs');
const path = require('path');
const d = console.log;
const modelDir = 'common/models';

const models = fs.readdirSync(path.resolve(__dirname, modelDir));
d(models);

const parameterMap = function (o) {
  return o.name;
};
const constructorMap = function (o) {
  if (o.tsType === 'Date') {
    return `this.${o.name} = ${o.name} ? new Date(${o.name}) : undefined;`;
  }
  if (o.tsType === 'float') {
    return `this.${o.name} = !isNaN(parseFloat(${o.name} + '')) ? parseFloat(${o.name} + '') : undefined; `;
  }
  if (o.tsType === 'int') {
    return `this.${o.name} = !isNaN(parseInt(${o.name} + '', 10)) ? parseInt(${o.name} + '', 10) : undefined; `;
  }
  return `this.${o.name} = ${o.name};`;
};

function getClassText(model) {
  let typescript = false;
  let propertyLines = [];
  let propList = [];
  for (let prop in model.properties) {
    let val = model.properties[prop];
    val.name = prop;

    propList.push(val);

    // Map loopback types to typescript types
    let tsType = "";
    let propertyType = "";
    switch (val.postgresql.dataType) {
      case "text":
      case "character varying":
        tsType = "string";
        propertyType = "string";
        break;
      case "bigint":
      case "integer":
        tsType = "int";
        propertyType = "number";
        break;
      case "float":
      case "numeric":
        tsType = "float";
        propertyType = "number";
        break;
      case "timestamp with time zone":
      case "date":
        tsType = "Date";
        propertyType = "Date";
        break;
      case "boolean":
      case "smallint":
        tsType = "boolean";
        propertyType = "boolean";
        break;
      case "json":
      case "jsonb":
        tsType = "object";
        propertyType = "object";
        break;

      default:
        console.log(val.postgresql.dataType);
        throw 'Unknown loopback postgresql type';
    }

    // List all the properties which are not unique
    val.tsType = tsType;
    propertyLines.push(typescript ?
      `${prop}: ${propertyType};` :
      `${prop}`
    );
  }
  return `
class gen_${model.name} {
	constructor({${propList.map(parameterMap).join(', ')}}) {
		${propList.map(constructorMap).join('\n')}
	}
}`;
}

for (let i = 0; i < models.length; i++) {
  const model = require(path.resolve(__dirname, modelDir, models[i]));
  const classText = getClassText(model);
  d(classText);
}

