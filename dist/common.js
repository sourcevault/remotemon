var fs, most, R, yaml, hop, chokidar, be, optionator, mostCreate, child_process, esp, stringify, l, z, spawn, exec, noop, j, join, joinType, CUSTOM_SCHEMA, readYaml, readJson, lit, x$, c, showStack, main;
fs = require("fs");
most = require("most");
R = require("ramda");
yaml = require('js-yaml');
hop = require("hoplon");
chokidar = require("chokidar");
be = require("valleydate");
optionator = require("optionator");
mostCreate = require("@most/create");
mostCreate = mostCreate.create;
child_process = require("child_process");
esp = require("error-stack-parser");
stringify = require("./vendor").stringify;
l = console.log;
z = l;
spawn = function(cmd){
  return child_process.spawnSync(cmd, {
    shell: true,
    stdio: "inherit"
  });
};
exec = function(cmd){
  return child_process.execSync(cmd).toString();
};
noop = function(){};
j = function(x){
  return l(stringify(x, {
    maxLength: 30,
    margins: true
  }));
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
readYaml = function(name){
  var data, loaded;
  data = fs.readFileSync(name);
  loaded = yaml.load(data, {
    schema: CUSTOM_SCHEMA
  });
  return loaded;
};
readJson = function(filename){
  return JSON.parse(
  R.toString(
  fs.readFileSync(filename)));
};
lit = function(strs, cols){
  var diff, I, In;
  if (strs.length > cols.length) {
    diff = strs.length - cols.length;
    I = cols.length;
    In = strs.length;
    while (I < In) {
      cols[I] = null;
      I += 1;
    }
  }
  return lit.internal(strs, cols);
};
lit.internal = R.pipe(R.zipWith(function(x, f){
  switch (R.type(f)) {
  case 'Function':
    return f(x);
  default:
    return x;
  }
}), R.join(""), console.log);
x$ = c = {};
x$.ok = function(txt){
  return "\x1B[38;5;2m" + txt + "\x1B[39m";
};
x$.er1 = function(txt){
  return "\x1B[38;5;3m" + txt + "\x1B[39m";
};
x$.er2 = function(txt){
  return "\x1B[38;5;13m" + txt + "\x1B[39m";
};
x$.er3 = function(txt){
  return "\x1B[38;5;1m" + txt + "\x1B[39m";
};
x$.warn = function(txt){
  return "\x1B[38;5;11m" + txt + "\x1B[39m";
};
x$.pink = function(txt){
  return "\x1B[38;5;17m" + txt + "\x1B[39m";
};
x$.grey = function(txt){
  return "\x1B[38;5;8m" + txt + "\x1B[39m";
};
x$.blue = function(txt){
  return "\x1B[38;5;12m" + txt + "\x1B[39m";
};
showStack = function(){
  var E, i$, len$, I, lineNumber, fileName, functionName, columnNumber, path, first, second, results$ = [];
  E = esp.parse(new Error());
  E = R.drop(7, E);
  for (i$ = 0, len$ = E.length; i$ < len$; ++i$) {
    I = E[i$];
    lineNumber = I.lineNumber, fileName = I.fileName, functionName = I.functionName, columnNumber = I.columnNumber;
    path = fileName.split("/");
    first = path[0], second = path[1];
    if (first === 'internal' && second === 'modules') {
      continue;
    }
    if (functionName === 'Object.<anonymous>') {
      functionName = "";
    }
    results$.push(lit(["  - ", R.last(path), ":", lineNumber, " ", functionName, "\n    ", fileName + ":", lineNumber, ":" + columnNumber + "\n"], [0, c.warn, 0, c.er1, 0, 0, 0, c.grey, c.er1, c.grey]));
  }
  return results$;
};
main = {
  j: j,
  z: z,
  R: R,
  l: l,
  c: c,
  be: be,
  fs: fs,
  lit: lit,
  hop: hop,
  noop: noop,
  yaml: yaml,
  exec: exec,
  most: most,
  spawn: spawn,
  chokidar: chokidar,
  readYaml: readYaml,
  readJson: readJson,
  optionator: optionator,
  showStack: showStack,
  mostCreate: mostCreate,
  child_process: child_process
};
module.exports = main;