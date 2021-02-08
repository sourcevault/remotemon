var com, fs, most, R, yaml, hop, chokidar, be, optionator, temp, child_process, join, joinType, CUSTOM_SCHEMA, readYaml, readJson, x$, registry, y$;
com = require("@sourcevault/utils.common");
fs = require("fs");
com.fs = fs;
most = require("most");
com.most = most;
R = require("ramda");
yaml = require("js-yaml");
hop = require("hoplon");
com.hop = hop;
chokidar = require("chokidar");
com.chokidar = chokidar;
be = require("valleydate");
com.be = be;
optionator = require("optionator");
com.optionator = optionator;
temp = require("@most/create");
com.most_create = temp.create;
child_process = require("child_process");
R = com.R;
com.spawn = function(cmd){
  return child_process.spawnSync(cmd, {
    shell: true,
    stdio: "inherit"
  });
};
com.exec = function(cmd){
  return child_process.execSync(cmd).toString();
};
join = {
  kind: "sequence",
  resolve: function(data){
    var i$, len$, I, ref$;
    data = R.flatten(data);
    for (i$ = 0, len$ = data.length; i$ < len$; ++i$) {
      I = data[i$];
      if (!((ref$ = R.type(I)) === 'String' || ref$ === 'Number')) {
        return false;
      }
    }
    return true;
  },
  construct: function(data){
    data = R.flatten(data);
    return data.join("");
  }
};
joinType = new yaml.Type("!join", join);
CUSTOM_SCHEMA = yaml.Schema.create([joinType]);
readYaml = function(string){
  var loaded;
  loaded = yaml.load(string, {
    schema: CUSTOM_SCHEMA
  });
  return loaded;
};
readJson = function(filename){
  return JSON.parse(
  R.toString(
  fs.readFileSync(filename)));
};
com.readYaml = readYaml;
com.readJson = readJson;
x$ = registry = {};
y$ = x$.metadata = {};
y$.name = null;
y$.repourl = null;
y$.homepage = null;
y$.version = null;
x$.print = {};
x$.com = com;
x$.pkg = null;
x$.core = null;
x$.validator = null;
x$.data = {};
module.exports = registry;