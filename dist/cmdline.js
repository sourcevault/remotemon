// Generated by LiveScript 1.6.0
var reg, com, print, metadata, l, z, j, R, fs, lit, c, readJson, readYaml, be, optionator, hop, exec, current_version, Er, cmd_options, cmdparser, validate, filterForConfigFile, entry;
reg = require("./registry");
require("./print");
require("./data");
require("./core");
require("./validator");
com = reg.com, print = reg.print, metadata = reg.metadata;
l = com.l, z = com.z, j = com.j, R = com.R, fs = com.fs, lit = com.lit, c = com.c;
readJson = com.readJson, readYaml = com.readYaml, be = com.be, j = com.j, optionator = com.optionator, hop = com.hop, exec = com.exec;
try {
  current_version = readJson(__dirname + "/../package.json").version;
} catch (e$) {
  Er = e$;
  print.unableToParsePackageJson();
}
cmd_options = {
  prepend: "Usage: remotemon [ config file path ] [ command name ]",
  append: current_version,
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
validate = {};
filterForConfigFile = R.pipe(R.split("\n"), R.filter(function(str){
  return str === "." + metadata.name + ".yaml";
}));
validate.config = function(opt){
  var name, raw, isthere;
  switch (R.type(opt.config)) {
  case 'String':
    if (!fs.existsSync(opt.config)) {
      lit(["[" + metadata.name + "][Error] cannot find configuration file ", opt.config + "", "."], [c.er1, c.warn, c.er1]);
      return false;
    }
    return opt;
  case 'Undefined':
  case 'Null':
    name = metadata.name;
    raw = exec(" ls -lAh . | grep -v '^d' | awk 'NR>1 {print $NF}'");
    isthere = filterForConfigFile(raw);
    if (isthere.length === 1) {
      lit(["[" + name + "] using ", "." + name + ".yaml"], [c.ok, c.warn]);
      opt.config = isthere[0];
      return opt;
    }
    raw = exec(" ls -lAh .. | grep -v '^d' | awk 'NR>1 {print $NF}'");
    isthere = filterForConfigFile(raw);
    if (isthere.length === 1) {
      lit(["[" + name + "] using ", "../." + name + ".yaml"], [c.ok, c.warn]);
      opt.config = "../" + isthere[0];
      return opt;
    }
    lit(["[" + name + "][Error] ", "config file not provided and ." + name + ".yaml also not present."], [c.er1, c.warn]);
    return false;
  default:
    lit(["[" + name + "][Error] .config can only be string type."], [c.er1, c.warn, c.er1]);
    return false;
  }
};
entry = hop.arn([0, 1, 2], print.incorrect_arg_num).arma(0, function(){
  var opt, out;
  opt = cmdparser.parseArgv(process.argv);
  if (opt.help) {
    cmdparser.generateHelp();
    return false;
  }
  opt.config = "./test/opts1.yaml";
  out = validate.config(opt);
  return out;
}, function(opt){
  var cmd, x$, data;
  cmd = opt._;
  x$ = data = {};
  x$.cmd = cmd;
  x$.filename = opt.config;
  x$.verbose = opt.verbose;
  return reg.validator(data);
}).def();
reg.pkg = entry;
module.exports = entry;