var com, z, fs, most, R, yaml, hop, chokidar, be, optionator, temp, child_process, readJson, x$, registry, y$;
com = require("@sourcevault/utils.common");
z = com.z;
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
com.tampax = require("tampax");
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
readJson = function(filename){
  return JSON.parse(
  R.toString(
  fs.readFileSync(filename)));
};
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