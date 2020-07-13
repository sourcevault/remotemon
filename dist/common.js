// Generated by LiveScript 1.6.0
(function(){
  var jsYaml, jsRender, fs, child_process, R, optionator, chokidar, chalk, prettyError, reg, l, z, noop, j, readYaml, readJson, x$, pe, showStack, main;
  jsYaml = require('js-yaml');
  jsRender = require('json-stringify-pretty-compact');
  fs = require("fs");
  child_process = require("child_process");
  R = require("ramda");
  optionator = require("optionator");
  chokidar = require("chokidar");
  chalk = require("chalk");
  prettyError = require("pretty-error");
  reg = require("./registry");
  l = console.log;
  z = l;
  noop = function(){};
  j = function(json){
    l(jsRender(json));
  };
  readYaml = function(name){
    return jsYaml.safeLoad(fs.readFileSync(name));
  };
  readJson = function(filename){
    return JSON.parse(
    R.toString(
    fs.readFileSync(filename)));
  };
  x$ = pe = {};
  x$.filterParsedError = null;
  x$.skip = null;
  x$.appendStyle = null;
  x$.init = null;
  x$.main = null;
  pe.filterParsedError = function(Error){
    Error._trace = R.drop(4, Error._trace);
    return Error;
  };
  pe.skip = function(traceLine, lineNumber){
    if (traceLine.packageName === "guard-js") {
      return true;
    }
    if (traceLine.packageName === "valleydate") {
      return true;
    }
    if (traceLine.dir === "internal/main") {
      return true;
    }
    if (traceLine.dir === "internal/modules/cjs") {
      return true;
    }
    if (traceLine.what === "Object.print.stack") {
      return true;
    }
    if (traceLine.what === "handle.fun.get.entry [as get]") {
      return true;
    }
    return false;
  };
  pe.appendStyle = {
    "pretty-error > header > title > kind": {
      display: "none"
    },
    "pretty-error > header > colon": {
      display: "none"
    },
    "pretty-error > header > message": {
      display: "none"
    }
  };
  pe.init = function(){
    var local;
    local = new prettyError();
    local.skipNodeFiles();
    local.filterParsedError(pe.filterParsedError);
    local.skip(pe.skip);
    local.appendStyle(pe.appendStyle);
    return local;
  };
  pe.main = pe.init();
  showStack = function(){
    var str;
    str = pe.main.render(new Error());
    l(str);
  };
  R.tryCatch(function(filename){
    var raw, pj;
    raw = readJson(filename);
    pj = reg.packageJ;
    pj.name = raw.name;
    pj.repourl = raw.repository;
    pj.homepage = raw.homepage;
    pj.version = raw.version;
  }, function(){
    l(reg.c.dark.er("unable to locate package.json of module."));
    showStack();
  })(
  __dirname + "/../package.json");
  main = {
    j: j,
    z: z,
    fs: fs,
    R: R,
    l: l,
    noop: noop,
    child_process: child_process,
    chalk: chalk,
    readYaml: readYaml,
    jsYaml: jsYaml,
    optionator: optionator,
    chokidar: chokidar,
    readJson: readJson,
    showStack: showStack
  };
  module.exports = main;
}).call(this);
