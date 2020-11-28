var reg, com, print, metadata, validator, l, z, j, R, fs, lit, c, readJson, readYaml, be, optionator, hop, exec, validate2, entry;
reg = require("./registry");
require("./print");
require("./data");
require("./core");
require("./validator");
com = reg.com, print = reg.print, metadata = reg.metadata, validator = reg.validator;
l = com.l, z = com.z, j = com.j, R = com.R, fs = com.fs, lit = com.lit, c = com.c;
readJson = com.readJson, readYaml = com.readYaml, be = com.be, j = com.j, optionator = com.optionator, hop = com.hop, exec = com.exec, be = com.be;
print.showHeader();
validate2 = be.arg.on(0, be.str).on(1, be.arr.map(be.str).or(be.str.cont(function(str){
  return [str];
}))).cont(function(arg$){
  var filename, cmd, x$, data;
  filename = arg$[0], cmd = arg$[1];
  filename = validator.findfile(filename);
  if (!filename) {
    return null;
  }
  x$ = data = {};
  x$.cmd = cmd;
  x$.filename = filename;
  x$.verbose = true;
  return reg.validator(data);
});
entry = hop.arn([1, 2], print.incorrect_arg_num).ar(1, function(obj){
  var verbose, state;
  if (!metadata.name) {
    return false;
  }
  if (obj.verbose) {
    verbose = true;
  } else {
    verbose = false;
  }
  obj.verbose = undefined;
  state = {
    filename: undefined,
    origin: obj,
    cmd: [],
    fin: {
      cmd: [],
      filename: undefined,
      verbose: verbose,
      def: {},
      user: {}
    }
  };
  return reg.validator.only_object.auth(obj, state);
}).ar(2, function(){
  if (!metadata.name) {
    return false;
  }
  return validate2.auth(arguments);
}).def();
module.exports = entry;