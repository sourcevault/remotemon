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
ME.has = function(props){
  return function(ob){
    var i$, ref$, len$, key;
    for (i$ = 0, len$ = (ref$ = props).length; i$ < len$; ++i$) {
      key = ref$[i$];
      if (ob.hasOwnProperty(key)) {
        return true;
      }
    }
    return false;
  };
};
ME.has_file_filter = ME.has(data.opt.filter);
rmEmptyStr = R.filter(function(x){
  if (x.length === 0) {
    return false;
  } else {
    return true;
  }
});
util.str2arr = function(x){
  return [x];
};
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
    return [false, ['merge', ['empty_object']]];
  default:
    return [false, ['object']];
  }
})).or(be.undefnull.cont(undefined))).alt(be.str.cont(util.str2arr)).cont(function(list){
  var out, i$, len$, I;
  out = [];
  for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
    I = list[i$];
    if (!(I === undefined)) {
      out.push(I);
    }
  }
  return out;
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
ME.strlist.undef = ME.strlist(undefined);
unu = be.undefnull.cont(undefined).err(undefined);
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
ME.opt = {};
ME.opt.string = be.str.and(function(str){
  if (!data.opt.bool.has(str)) {
    return [false, ['opt', [2, [str + "", " not a valid boolean rsync option."]]]];
  }
  return true;
});
ME.opt.object = be.obj.and(function(ob){
  var keys, k;
  keys = Object.keys(ob);
  if (!(keys.length === 1)) {
    return [false, ['opt', [1, ["object can only have singular attribute."]]]];
  }
  k = keys[0];
  if (!data.opt.objectProps.has(k)) {
    return [false, ['opt', [2, [k + "", " not a valid compound rsync option."]]]];
  }
  return true;
}).cont(function(ob){
  var ref$, key, val;
  if ((ref$ = (function(){
    var ref$, results$ = [];
    for (key in ref$ = ob) {
      val = ref$[key];
      results$.push(val);
    }
    return results$;
  }())[0]) === undefined || ref$ === null) {
    return undefined;
  } else {
    return ob;
  }
});
ME.chokidar = be.obj.on(data.chokidar.bools, ME.maybe.bool).on(['ignored', 'cwd'], ME.maybe.str).on('awaitWriteFinish', ME.maybe.obj.on(['stabilityThreshold', 'pollInterval'], ME.maybe.num).or(be.bool)).on(['interval', 'binaryInterval', 'depth'], ME.maybe.num);
ME.opt.main = be.arr.map(ME.opt.string.or(ME.opt.object.cont(function(ob){
  var key, I;
  key = Object.keys(ob)[0];
  if (key === 'exclude' || key === 'include' || key === 'exclude-from' || key === 'include-from') {
    return (function(){
      var i$, ref$, len$, ref1$, results$ = [];
      for (i$ = 0, len$ = (ref$ = ob[key + ""]).length; i$ < len$; ++i$) {
        I = ref$[i$];
        results$.push((ref1$ = {}, ref1$[key + ""] = I, ref1$));
      }
      return results$;
    }());
  }
  return ob;
})).or(be.arr.err(undefined).and(function(arr){
  var ret;
  ret = ME.opt.main.auth(arr);
  if (ret['continue']) {
    return true;
  }
  return [false, ret.message, ret.path];
})).or(unu).err(function(msg){
  var first, second;
  first = msg[0], second = msg[1];
  if (first[0] === 'opt') {
    return first;
  }
  if (second[0] === 'opt') {
    return second;
  }
  return ['opt', [1, "not string of singular object"]];
})).or(unu).cont(R.flatten);
ME.rsync = be.restricted(['src', 'des', 'opt']).on('src', ME.strlist.undef).on('des', ME.maybe.str).on('opt', ME.opt.main).or(be.bool.cont(function(x, state){
  var rsync, def;
  rsync = arguments[3].origin.rsync;
  if (x === true) {
    def = {
      src: rsync.src,
      des: rsync.des,
      opt: rsync.opt
    };
    return def;
  } else {
    return x;
  }
})).or(unu);
ME.user = be.obj.or(be.undefnull.cont(function(){
  return {};
})).and(be.restricted(data.selected_keys.arr)).on('initialize', ME.maybe.bool).on('watch', ME.strlist.undef).on('remotetask', ME.strlist.undef).on('localbuild', ME.strlist.undef).on('postscript', ME.strlist.undef).on('chokidar', ME.chokidar.or(unu)).on('rsync', ME.rsync);
ME.main = be.required(['remotehost', 'remotefold']).on(['remotehost', 'remotefold'], be.str).on('initialize', be.bool.or(be.undefnull.cont(true))).on('watch', ME.strlist.dot).on('localbuild', ME.strlist.empty).on('postscript', ME.strlist.empty).on('remotetask', ME.strlist.empty).on('chokidar', ME.chokidar.or(be.undefnull.cont(data.def.chokidar))).on('rsync', be.obj.alt(be.undefnull.cont(function(){
  return {};
})).on('src', ME.strlist(["."])).on('des', be.str.or(be.undefnull.cont(function(){
  return arguments[3].origin.remotefold;
}))).on('opt', be.arr.or(be.undefnull.cont(data.def.rsync)).and(ME.opt.main)).or(be.bool.cont(function(raw){
  var def;
  if (raw === true) {
    def = {
      src: ["."],
      des: arguments[2].origin.remotefold,
      opt: data.rsyncOpt
    };
    return def;
  } else {
    return false;
  }
})).err(function(arg$){
  var msg;
  msg = arg$[0];
  return msg;
})).and(function(data, state){
  var i$, ref$, len$, I;
  for (i$ = 0, len$ = (ref$ = state.cmd).length; i$ < len$; ++i$) {
    I = ref$[i$];
    if (!data[I]) {
      return [false, ['usercmd_not_defined', I]];
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
}).err(function(msg, path, arg$){
  var filename, loc, Error, F;
  filename = arg$.filename;
  loc = msg[0], Error = msg[1];
  F = (function(){
    switch (loc) {
    case 'req':
      return print.reqError;
    case 'res':
      return print.resError;
    case 'usercmd_not_defined':
      return print.usercmd_not_defined;
    case 'opt':
      return print.optError;
    default:
      Error = msg[0];
      return print.basicError;
    }
  }());
  return F(Error, path, filename, msg);
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
}).cont(reg.core);
entry = function(data){
  var FILENAME, raw, Er, state, ref$;
  FILENAME = process.cwd() + "/" + data.filename;
  try {
    raw = readYaml(FILENAME);
  } catch (e$) {
    Er = e$;
    if (data.verbose) {
      l(Er);
    }
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