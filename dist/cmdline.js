#!/usr/bin/env node

var reg, com, print, metadata, validator, l, z, j, R, fs, lit, readJson, readYaml, be, optionator, hop, exec, cmd_options, cmdparser, opt, filename, x$, data;
reg = require("./registry");
require("./print");
require("./data");
require("./core");
require("./validator");
com = reg.com, print = reg.print, metadata = reg.metadata, validator = reg.validator;
l = com.l, z = com.z, j = com.j, R = com.R, fs = com.fs, lit = com.lit;
readJson = com.readJson, readYaml = com.readYaml, be = com.be, j = com.j, optionator = com.optionator, hop = com.hop, exec = com.exec;
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
    }
  ]
};
cmdparser = optionator(cmd_options);
print.showHeader();
if (!metadata.name) {
  return false;
}
opt = cmdparser.parseArgv(process.argv);
if (opt.help) {
  cmdparser.generateHelp();
  return false;
}
filename = opt.config;
filename = validator.findfile(filename);
if (!filename) {
  return undefined;
}
x$ = data = {};
x$.cmd = opt._;
x$.filename = filename;
x$.verbose = opt.verbose;
reg.validator(data);