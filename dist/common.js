var fs, most, flyd, R, yaml, hop, chokidar, cc, be, optionator, mostCreate, prettyError, child_process, jspc, l, z, spawn, exec, noop, j, join, joinType, CUSTOM_SCHEMA, readYaml, readJson, pe, showStack, lit, x$, c, main;
fs = require("fs");
most = require("most");
flyd = require("flyd");
R = require("ramda");
yaml = require('js-yaml');
hop = require("hoplon");
chokidar = require("chokidar");
cc = require("cli-color");
be = require("valleydate");
optionator = require("optionator");
mostCreate = require("@most/create");
mostCreate = mostCreate.create;
prettyError = require("pretty-error");
child_process = require("child_process");
jspc = require("@aitodotai/json-stringify-pretty-compact");
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
  return l(jspc(x, {
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
pe = new prettyError();
pe.skipNodeFiles();
pe.filterParsedError(function(Error){
  Error._trace = R.takeLast(6, Error._trace);
  return Error;
});
pe.skip(function(traceLine, lineNumber){
  if (traceLine.dir === "internal/modules/cjs") {
    return true;
  }
  if (traceLine.dir === "internal/modules") {
    return true;
  }
  if (R.includes("valleydate", traceLine.packages)) {
    return true;
  }
  return false;
});
pe.appendStyle({
  "pretty-error > header > title > kind": {
    display: "none"
  },
  "pretty-error > header > colon": {
    display: "none"
  },
  "pretty-error > header > message": {
    display: "none"
  }
});
showStack = function(){
  var str;
  str = pe.render(new Error());
  l(str);
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
x$.ok = cc.xterm(2);
x$.er1 = cc.xterm(3);
x$.er2 = cc.xterm(13);
x$.er3 = cc.xterm(1);
x$.warn = cc.xterm(11);
x$.warn1 = cc.xterm(17);
x$.grey = cc.xterm(8);
main = {
  j: j,
  z: z,
  R: R,
  l: l,
  c: c,
  cc: cc,
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
  prettyError: prettyError,
  child_process: child_process
};
module.exports = main;