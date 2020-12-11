var reg, com, print, data, metadata, l, z, j, R, readJson, readYaml, be, optionator, lit, c, exec, fs, maybe, log, ME, rm, util, filterForConfigFile, rmEmptyStr, unu, rmAllUndef, merge, entry;
reg = require("./registry");
require("./print");
require("./data");
com = reg.com, print = reg.print, data = reg.data, metadata = reg.metadata;
l = com.l, z = com.z, j = com.j, R = com.R;
readJson = com.readJson, readYaml = com.readYaml, be = com.be, j = com.j, optionator = com.optionator, lit = com.lit, c = com.c, exec = com.exec, fs = com.fs;
maybe = be.maybe;
log = function(x){
  l(x);
  return x;
};
ME = {};
rm = {};
util = {};
filterForConfigFile = R.pipe(R.split("\n"), R.filter(function(str){
  return str === "." + metadata.name + ".yaml";
}));
ME.findfile = function(filename){
  var name, raw, isthere;
  switch (R.type(filename)) {
  case 'String':
    if (!fs.existsSync(filename)) {
      lit(["[" + metadata.name + "][Error] cannot find configuration file ", filename + "", "."], [c.er1, c.warn, c.er1]);
      return false;
    }
    return filename;
  case 'Undefined':
  case 'Null':
    name = metadata.name;
    raw = exec(" ls -lAh . | grep -v '^d' | awk 'NR>1 {print $NF}'");
    isthere = filterForConfigFile(raw);
    if (isthere.length === 1) {
      lit(["[" + name + "] using ", process.cwd() + ("/." + name + ".yaml")], [c.ok, c.warn]);
      return isthere[0];
    }
    raw = exec(" ls -lAh .. | grep -v '^d' | awk 'NR>1 {print $NF}'");
    isthere = filterForConfigFile(raw);
    if (isthere.length === 1) {
      lit(["[" + name + "]", " using ", R.init(process.cwd().split("/")).join("/") + ("/." + name + ".yaml")], [c.ok, c.grey, c.warn]);
      return "../" + isthere[0];
    }
    lit(["[" + name + "][Error] ", "\n - ." + name + ".yaml or /../." + name + ".yaml not present. \n - custom config file is also not provided."], [c.er1, c.grey]);
    return false;
  default:
    lit(["[" + name + "][Error] .config can only be string type."], [c.er1, c.warn, c.er1]);
    return false;
  }
};
rmEmptyStr = R.filter(function(x){
  if (x.length === 0) {
    return false;
  } else {
    return true;
  }
});
ME.recursiveStrList = be.arr.map(be.arr.and(function(arr){
  var ret;
  ret = ME.recursiveStrList.auth(arr);
  if (ret['continue']) {
    return true;
  }
  return [false, ret.message, ret.path];
}).cont(R.flatten).or(be.str).or(be.obj.and(function(obj){
  var keys;
  keys = Object.keys(obj);
  switch (keys.length) {
  case 0:
    return [false, ['ob_in_str_list', ['empty_object']]];
  default:
    return [false, ['ob_in_str_list', ['object']]];
  }
})).or(be.undefnull)).alt(be.str).cont(function(list){
  var out, i$, len$, I;
  out = [];
  for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
    I = list[i$];
    switch (typeof I) {
    case "undefined":
      break;
    case "object":
      out.push.apply(out, I);
      break;
    default:
      out.push(I);
    }
  }
  return out;
}).err(function(arg$){
  var first;
  first = arg$[0];
  return first;
}).err(function(msg){
  var type;
  type = msg[0];
  switch (type) {
  case 'ob_in_str_list':
    return msg;
  }
  return "not string or string list.";
});
ME.strlist = function(F){
  return ME.recursiveStrList.or(be.undefnull.cont(F));
};
ME.strlist.empty = ME.strlist(function(){
  return [];
});
ME.strlist.dot = ME.strlist(function(){
  return ["."];
});
ME.strlist.undef = ME.strlist(void 8);
unu = be.undefnull;
ME.maybe = {};
ME.maybe.bool = be.bool.or(unu);
ME.maybe.num = be.num.or(unu);
ME.maybe.str = be.str.or(unu);
ME.maybe.obj = be.obj.or(unu);
ME.maybe.arr = be.arr.or(unu);
rmAllUndef = function(obj){
  return JSON.parse(JSON.stringify(obj));
};
merge = R.mergeDeepWith(function(A, B){
  return B;
});
ME.rsync = {};
ME.rsync.string = be.str.and(function(str){
  if (!data.rsync.bool.has(str)) {
    return [false, ['rsync', [2, [str + "", " not a valid boolean rsync option."]]]];
  }
  return true;
});
ME.rsync.object = be.obj.and(function(ob){
  var keys, k;
  keys = Object.keys(ob);
  if (!(keys.length === 1)) {
    return [false, ['rsync', [1, ["object can only have singular attribute."]]]];
  }
  k = keys[0];
  if (!(data.rsync.compound.has(k) || (k === 'src' || k === 'des'))) {
    return [false, ['rsync', [2, [k + "", " not a valid compound rsync option."]]]];
  }
  switch (k) {
  case 'des':
    if (!(R.type(ob[k]) === 'string')) {
      return [false, ['rsync', [2, ["des", " only one remote destination folder for rsync."]]]];
    }
  }
  return true;
});
ME.chokidar = be.obj.on(data.chokidar.bools, ME.maybe.bool).on(['ignored', 'cwd'], ME.maybe.str).on('awaitWriteFinish', ME.maybe.obj.on(['stabilityThreshold', 'pollInterval'], ME.maybe.num).or(be.bool)).on(['interval', 'binaryInterval', 'depth'], ME.maybe.num);
ME.rsync.entry = be.arr.map(ME.rsync.string.or(ME.rsync.object).or(be.arr.err(void 8).and(function(arr){
  var ret;
  ret = Me.rsync.main.auth(arr);
  if (ret['continue']) {
    return true;
  }
  return [false, ret.message, ret.path];
})).or(unu)).or(unu).cont(R.flatten).or(unu);
ME.user = be.obj.or(be.undefnull.cont(function(){
  return {};
})).and(be.restricted(data.selected_keys.arr)).on('initialize', ME.maybe.bool).on('watch', ME.strlist.undef).on('remotetask', ME.strlist.undef).on('localbuild', ME.strlist.undef).on('postscript', ME.strlist.undef).on('chokidar', ME.chokidar.or(unu)).on('rsync', ME.rsync.entry);
ME.main = be.required(['remotehost', 'remotefold']).on(['remotehost', 'remotefold'], be.str).on('initialize', be.bool.or(be.undefnull.cont(true))).on('watch', ME.strlist.dot).on('localbuild', ME.strlist.empty).on('postscript', ME.strlist.empty).on('remotetask', ME.strlist.empty).on('chokidar', ME.chokidar.or(be.undefnull.cont(data.def.chokidar))).on('rsync', be.arr.or(be.undefnull.cont(function(){
  return data.def.rsync.concat({
    des: arguments[2].origin.remotefold
  });
})).and(ME.rsync.entry).or(be.bool.cont(function(raw){
  var def;
  if (raw === true) {
    def = data.def.rsync.concat({
      des: arguments[2].origin.remotefold
    });
    return def;
  } else {
    return false;
  }
}))).and(function(data, state){
  var i$, ref$, len$, I;
  for (i$ = 0, len$ = (ref$ = state.cmd).length; i$ < len$; ++i$) {
    I = ref$[i$];
    if (!data[I]) {
      return [false, ['usercmd_not_defined', [I]]];
    }
  }
  return true;
}).map(function(value, key, state){
  var fin, put;
  fin = state.fin;
  switch (data.selected_keys.set.has(key)) {
  case true:
    fin.def[key] = value;
    break;
  case false:
    put = ME.user.auth(value, key, state);
    if (put['continue']) {
      fin.user[key] = put.value;
    } else {
      return [false, put.message[0], put.path];
    }
  }
  state.fin = rmAllUndef(fin);
  return true;
}).err(be.grexato).err(function(all, path, arg$){
  var filename, topmsg, loc, Error, F;
  filename = arg$.filename;
  topmsg = all[0];
  loc = topmsg[0], Error = topmsg[1];
  F = (function(){
    switch (loc) {
    case 'req':
      return print.reqError;
    case 'res':
      return print.resError;
    case 'usercmd_not_defined':
      return print.usercmd_not_defined;
    case 'rsync':
      return print.rsyncError;
    case 'ob_in_str_list':
      return print.ob_in_str_list;
    default:

    }
  }());
  return F(Error, path, filename, topmsg);
}).cont(function(__, arg$){
  var fin, user, def, nuser, key, value;
  fin = arg$.fin;
  user = fin.user, def = fin.def;
  nuser = {};
  for (key in user) {
    value = user[key];
    nuser[key] = merge(def, value);
  }
  fin.user = nuser;
  return fin;
});
entry = function(data){
  var FILENAME, raw, Er, state, ref$;
  FILENAME = process.cwd() + "/" + data.filename;
  try {
    raw = readYaml(FILENAME);
  } catch (e$) {
    Er = e$;
    l(Er);
    print.unableToReadConfigYaml(data.filename);
    return null;
  }
  state = {
    filename: data.filename,
    origin: raw,
    cmd: data.cmd,
    fin: (ref$ = {}, import$(ref$, data), ref$.def = {}, ref$.user = {}, ref$)
  };
  return ME.main.auth(raw, state);
};
entry.only_object = ME.main;
entry.findfile = ME.findfile;
reg.validator = entry;
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}