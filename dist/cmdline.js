#!/usr/bin/env node

var reg, com, print, metadata, validator, l, z, j, R, fs, lit, c, readJson, most, be, optionator, hop, exec, chokidar, most_create, cmd_options, cmdparser, opt, str, split_by_var, filename, info_from_user, x$, data, $;
reg = require("./registry");
require("./print");
require("./data");
require("./core");
require("./validator");
com = reg.com, print = reg.print, metadata = reg.metadata, validator = reg.validator;
l = com.l, z = com.z, j = com.j, R = com.R, fs = com.fs, lit = com.lit, c = com.c;
readJson = com.readJson, most = com.most, be = com.be, j = com.j, optionator = com.optionator, hop = com.hop, exec = com.exec, chokidar = com.chokidar, most_create = com.most_create;
cmd_options = {
  prepend: "Usage: remotemon [ command name ]",
  append: metadata.version,
  options: [
    {
      option: 'help',
      alias: 'h',
      type: 'Boolean',
      description: 'displays help'
    }, {
      option: 'config',
      alias: 'c',
      type: 'String',
      description: 'path to configuration file'
    }, {
      option: 'verbose',
      alias: 'v',
      type: 'Boolean',
      description: 'verbose messages'
    }, {
      option: 'version',
      alias: 'V',
      type: 'Boolean',
      description: 'displays version number'
    }, {
      option: 'dry-run',
      alias: 'n',
      type: 'Boolean',
      description: 'perform a trial run without making any changes'
    }
  ]
};
cmdparser = optionator(cmd_options);
if (!metadata.name) {
  return false;
}
opt = cmdparser.parseArgv(process.argv);
if (opt.help) {
  l(cmdparser.generateHelp());
  str = "\nBy default remotemon will look for .remotemon.yaml in current directory and one level up (only).\n\nusing --config <filename>.yaml option will direct remotemon to use <filename>.yaml as config file :\n\n> remotemon --config custom.yaml\n> remotemon --config custom.yaml -verbose\n\nvalues for internal variables can be changed using '=' :\n\n> remotemon --config custom.yaml -verbose file=dist/main.js\n";
  l(str);
  return 0;
}
split_by_var = function(rest){
  var fin, i$, len$, I, which, vars, ref$;
  fin = {
    cmd: [],
    vars: []
  };
  for (i$ = 0, len$ = rest.length; i$ < len$; ++i$) {
    I = rest[i$];
    which = I.split("=");
    switch (which.length) {
    case 1:
      fin.cmd.push(which[0]);
      break;
    case 2:
      fin.vars.push(which);
    }
  }
  vars = {};
  for (i$ = 0, len$ = (ref$ = fin.vars).length; i$ < len$; ++i$) {
    I = ref$[i$];
    vars[I[0]] = I[1];
  }
  fin.vars = vars;
  return fin;
};
print.showHeader();
if (opt.version) {
  return 0;
}
filename = opt.config;
filename = validator.findfile(filename);
if (!filename) {
  return null;
}
info_from_user = split_by_var(opt._);
x$ = data = {};
x$.cmd = info_from_user.cmd;
x$.vars = info_from_user.vars;
x$.filename = filename;
x$.verbose = opt.verbose;
x$.dryRun = opt.dryRun;
x$.commandline = R.drop(2, process.argv);
$ = most_create(function(add, end, error){
  var watcher;
  watcher = chokidar.watch(filename, {
    awaitWriteFinish: true
  });
  watcher.on('change', add);
  setTimeout(add, 0);
  return function(){
    watcher.close();
    return end();
  };
}).loop(function(I){
  var $new;
  if (I) {
    l(lit(["[" + metadata.name + "]", " configuration file ", filename + "", " itself has changed, restarting watch.."], [c.ok, c.pink, c.warn, c.pink]));
  }
  $new = reg.validator(data);
  return {
    seed: I + 1,
    value: $new
  };
}, 0).chain(function($){
  return $;
}).map(function(vo){
  if (vo['continue']) {
    return vo.value;
  } else {
    return most.empty();
  }
}).switchLatest().drain();