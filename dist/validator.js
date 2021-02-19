var reg, com, print, data, metadata, l, z, j, R, readJson, be, optionator, lit, c, exec, fs, zj, tampax, most_create, maybe, log, ME, rm, util, filterForConfigFile, replace_single_qoute, unu, rm_all_undef, is_true, is_false, grouparr, organizeRsync, mergeF, vre, yaml_tokenize, vars, isref, entry;
reg = require("./registry");
require("./print");
require("./data");
com = reg.com, print = reg.print, data = reg.data, metadata = reg.metadata;
l = com.l, z = com.z, j = com.j, R = com.R;
readJson = com.readJson, be = com.be, j = com.j, optionator = com.optionator, lit = com.lit, c = com.c, exec = com.exec, fs = com.fs, zj = com.zj, tampax = com.tampax, most_create = com.most_create;
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
  var name, raw, isthere, middle;
  switch (R.type(filename)) {
  case 'String':
    if (!fs.existsSync(filename)) {
      l(lit(["[" + metadata.name + "]", "[Error]", " cannot find configuration file ", filename + "", "."], [c.er3, c.er1, c.warn, c.er1]));
      return false;
    }
    return filename;
  case 'Undefined':
  case 'Null':
    name = metadata.name;
    raw = exec(" ls -lAh . | grep -v '^d' | awk 'NR>1 {print $NF}'");
    isthere = filterForConfigFile(raw);
    if (isthere.length === 1) {
      l(lit(["[" + name + "] using ", process.cwd() + ("/." + name + ".yaml")], [c.ok, c.warn]));
      return isthere[0];
    }
    raw = exec(" ls -lAh .. | grep -v '^d' | awk 'NR>1 {print $NF}'");
    isthere = filterForConfigFile(raw);
    if (isthere.length === 1) {
      l(lit(["[" + name + "]", " using ", R.init(process.cwd().split("/")).join("/") + ("/." + name + ".yaml")], [c.ok, c.grey, c.warn]));
      return "../" + isthere[0];
    }
    middle = " - " + c.pink("." + name + ".yaml") + " or " + c.pink("/../." + name + ".yaml") + " not present.\n";
    l(lit(["[" + name + "][Error]\n", middle, " - custom config file is also not provided."], [c.er3, 0, c.grey]));
    return false;
  default:
    l(lit(["[" + name + "][Error] .config can only be string type."], [c.er1, c.warn, c.er1]));
    return false;
  }
};
ME.recursive_str_list = be.arr.map(be.arr.and(function(arr){
  var ret;
  ret = ME.recursive_str_list.auth(arr);
  if (ret['continue']) {
    return true;
  }
  return [false, ret.message, ret.path];
}).cont(R.flatten).or(be.str).or(be.obj.and(function(obj){
  var keys;
  keys = Object.keys(obj);
  switch (keys.length) {
  case 0:
    return [false, [':ob_in_str_list', 'empty_object']];
  default:
    return [false, [':ob_in_str_list', 'object']];
  }
})).or(be.undefnull)).alt(be.str).edit(function(list){
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
}).err(function(msg){
  return msg[0];
}).err(function(msg){
  var type;
  type = msg[0];
  switch (type) {
  case ':ob_in_str_list':
    return msg;
  }
  return "not string or string list.";
});
replace_single_qoute = function(list){
  var i$, len$, I, results$ = [];
  for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
    I = list[i$];
    results$.push(I.replace(/'/g, "'''"));
  }
  return results$;
};
ME.strlist = function(F){
  return ME.recursive_str_list.or(be.undefnull.cont(F));
};
ME.strlist.empty = ME.strlist(function(){
  return [];
});
ME.strlist.dot = ME.strlist(function(){
  return ["."];
});
ME.strlist.undef = ME.strlist(void 8);
unu = be.undefnull.cont(void 8);
ME.maybe = {};
ME.maybe.bool = be.bool.or(unu);
ME.maybe.num = be.num.or(unu);
ME.maybe.str = be.str.or(unu);
ME.maybe.obj = be.obj.or(unu);
ME.maybe.arr = be.arr.or(unu);
rm_all_undef = function(obj){
  return JSON.parse(JSON.stringify(obj));
};
is_true = function(x){
  return x === true;
};
is_false = function(x){
  return x === false;
};
ME.rsync = {};
ME.rsync.string = function(str){
  if (!data.rsync.bool.has(str)) {
    return [false, [':rsync', [2, [str + "", " not a valid boolean rsync option."]]]];
  }
  return true;
};
ME.rsync.object = be.obj.and(function(ob, __){
  var keys, k, val;
  keys = Object.keys(ob);
  if (!(keys.length === 1)) {
    return [false, [':rsync', [1, ["object can only have singular attribute."]]]];
  }
  k = keys[0];
  if (!(data.rsync.compound.has(k) || (k === 'src' || k === 'des'))) {
    return [false, [':rsync', [2, [k, " not a valid compound rsync option."]]]];
  }
  val = ob[k];
  if (k === 'des' || k === 'src') {
    if (!(R.type(val) === 'String')) {
      return [false, [':rsync', [2, [k, " can only be string type."]]]];
    }
  }
  return true;
});
grouparr = R.pipe(R.unnest, R.groupBy(function(v){
  return v[0];
}), R.map(R.map(function(x){
  return x[1];
})));
ME.rsync.check_if_error = function(detail){
  if (detail.error) {
    return [false, detail.error[0], detail.error[1]];
  }
  return true;
};
organizeRsync = function(list){
  var fin, i$, len$, index, I, keys, k, val, ret, result;
  if (list === false) {
    return false;
  }
  fin = {
    str: [],
    obnormal: [],
    obarr: [],
    des: [],
    src: [],
    error: false
  };
  for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
    index = i$;
    I = list[i$];
    switch (R.type(I)) {
    case 'String':
      if (!data.rsync.bool.has(I)) {
        fin.error = [':rsync', ['duo', [I, "not a valid boolean rsync option."]]];
        fin.error = [fin.error, index];
        return fin;
      }
      fin.str.push(I);
      break;
    case 'Object':
      keys = Object.keys(I);
      switch (keys.length) {
      case 0:
        fin.error = [':rsync', ['uno', ["empty object without any attribute"]]];
        fin.error = [fin.error, index];
        return fin;
      case 1:
        break;
      default:
        fin.error = [':rsync', ['uno', ["object can only have singular attribute."]]];
        fin.error = [fin.error, index];
        return fin;
      }
      k = keys[0];
      if (!(data.rsync.compound.has(k) || (k === 'src' || k === 'des'))) {
        fin.error = [':rsync', ['duo', [k, " not a valid compound rsync option."]]];
        fin.error = [fin.error, index];
        return fin;
      }
      val = I[k];
      if (k === 'des') {
        if (!(R.type(val) === 'String')) {
          fin.error = [':rsync', ['duo', ['des', " has to be string type."]]];
          fin.error = [fin.error, index];
          return fin;
        }
        if (fin.des.length === 1) {
          fin.error = [':rsync', ['duo', ['des', " there can't be multiple remote folders as destination."]]];
          fin.error = [fin.error, index];
          return fin;
        }
        fin.des.push(val);
      } else if (k === 'src' || data.rsync.filter.has(k)) {
        ret = ME.rsync.strarr.auth(val);
        if (ret.error) {
          fin.error = [':rsync', ['duo', [k, "can only be a list of string or just string."]]];
          fin.error = [fin.error, index];
          return fin;
        }
        if (k === 'src') {
          fin.src.push(ret.value);
        } else {
          fin.obarr.push((fn$()));
        }
      } else {
        switch (R.type(val)) {
        case 'String':
        case 'Number':
          fin.obnormal.push([k, val]);
          break;
        case 'Undefined':
        case 'Null':
          break;
        default:
          fin.error = [':rsync', ['duo', [k, "can only be a string (or number)."]]];
          fin.error = [fin.error, index];
          return fin;
        }
      }
      break;
    case "Array":
      result = organizeRsync(I);
      if (result.error) {
        fin.error = result.error[0];
        fin.error = [fin.error, [index, result.error[1]]];
        return fin;
      }
      fin.str = R.concat(fin.str, result.str);
      fin.obnormal = R.concat(fin.obnormal, result.obnormal);
      fin.obarr = R.concat(fin.obarr, result.obarr);
      fin.src = R.concat(fin.src, result.src);
      break;
    default:
      fin.error = [':rsync', ['uno', ["not valid rsync option."]]];
      fin.error = [fin.error, index];
      return fin;
    }
  }
  fin.obarr = grouparr(fin.obarr);
  fin.src = R.flatten(fin.src);
  return fin;
  function fn$(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = ret.value).length; i$ < len$; ++i$) {
      I = ref$[i$];
      results$.push([k, I]);
    }
    return results$;
  }
};
ME.rsync.strarr = be.arr.map(be.str).or(be.str.cont(function(s){
  return [s];
})).or(be.undefnull.cont([]));
ME.watch = ME.strlist.undef.or(be(is_true).cont(["."])).or(is_false);
ME.rsync.user = be.arr.or(be.undefnull.cont(void 8)).alt(be.bool.cont(function(val){
  var rsync;
  if (val === true) {
    rsync = arguments[3].origin.rsync;
    if (rsync) {
      return rsync;
    } else {
      return data.def.rsync.concat({
        des: arguments[3].origin.remotefold
      });
    }
  } else {
    return false;
  }
})).edit(organizeRsync).and(ME.rsync.check_if_error).cont(function(fin){
  if (!fin.des[0]) {
    fin.des.push(arguments[3].origin.remotefold);
  }
  if (fin.src.length === 0) {
    fin.src.push(".");
  }
  return fin;
});
ME.chokidar = be.obj.on(data.chokidar.bools, ME.maybe.bool).on(['ignored', 'cwd'], ME.maybe.str).on('awaitWriteFinish', ME.maybe.obj.on(['stabilityThreshold', 'pollInterval'], ME.maybe.num).or(be.bool)).on(['interval', 'binaryInterval', 'depth'], ME.maybe.num);
ME.user = be.obj.or(be.undefnull.cont(function(){
  return {};
}).err(void 8)).and(be.restricted(data.selected_keys.arr)).on('initialize', ME.maybe.bool).on('watch', ME.strlist.undef.or(be(is_true).cont(["."])).or(is_false)).on('ssh', be.str.or(unu)).on(['exec.remote', 'exec.locale', 'exec.finale'], ME.strlist.undef.cont(replace_single_qoute)).on('chokidar', ME.chokidar.or(unu)).on('rsync', ME.rsync.user);
ME.origin = be.obj.alt(unu.cont(function(){
  return {};
})).on('remotehost', be.str.or(unu)).on('remotefold', be.str.or(unu.cont("~"))).on('initialize', be.bool.or(be.undefnull.cont(true))).on('watch', ME.strlist.dot.or(be(is_true).cont(["."])).or(is_false)).on('ssh', be.str.or(be.undefnull.cont(data.def.ssh))).on(['exec.locale', 'exec.finale', 'exec.remote'], ME.strlist.empty.cont(replace_single_qoute)).on('chokidar', ME.chokidar.or(be.undefnull.cont(data.def.chokidar))).edit(function(data){
  arguments[2].temp = data;
  return data;
}).on('rsync', be(function(){
  var data;
  data = arguments[3].temp;
  arguments[3].temp = void 8;
  if (!data.remotefold || !data.remotehost) {
    return true;
  }
  return false;
}).cont(false).or(be.arr.alt(be.undefnull.cont(function(){
  return data.def.rsync.concat({
    des: arguments[3].origin.remotefold
  });
})).alt(be(function(x){
  return x === true;
}).cont(function(val){
  return data.def.rsync.concat({
    des: arguments[3].origin.remotefold
  });
})).edit(organizeRsync).and(ME.rsync.check_if_error).cont(function(fin){
  if (fin) {
    if (!fin.des[0]) {
      fin.des.push(arguments[3].origin.remotefold);
    }
    if (fin.src.length === 0) {
      fin.src.push(".");
    }
  }
  return fin;
}).or(is_false))).map(function(value, key, __, state){
  var put;
  switch (data.selected_keys.set.has(key)) {
  case true:
    state.def[key] = value;
    break;
  case false:
    put = ME.user.auth(value, key, state);
    if (put['continue']) {
      state.user[key] = put.value;
    } else {
      return [false, [put.message], put.path];
    }
  }
  return true;
}).and(function(raw, __, state){
  var i$, ref$, len$, I;
  for (i$ = 0, len$ = (ref$ = state.cmd).length; i$ < len$; ++i$) {
    I = ref$[i$];
    if (raw[I] === undefined) {
      return [false, [':usercmd_not_defined', I]];
    }
  }
  return true;
});
mergeF = function(a, b){
  if (!b) {
    return a;
  }
  return b;
};
ME.main = be.obj.on('cmd', be.arr.map(function(x){
  return !data.selected_keys.set.has(x);
}).err(function(x, id, __, state){
  return [':in_selected_key', [state.cmd[id], state.commandline]];
})).on('origin', ME.origin).err(be.flatato).err(function(all, path, arg$){
  var filename, topmsg, loc, Error, F;
  filename = arg$.filename;
  topmsg = all[0];
  loc = topmsg[0], Error = topmsg[1];
  F = (function(){
    switch (loc) {
    case ':in_selected_key':
      return print.in_selected_key;
    case ':req':
      return print.reqError;
    case ':res':
      return print.resError;
    case ':usercmd_not_defined':
      return print.usercmd_not_defined;
    case ':rsync':
      return print.rsyncError;
    case ':ob_in_str_list':
      return print.ob_in_str_list;
    default:
      Error = all[0];
      return print.basicError;
    }
  }());
  return F(Error, path, filename, all);
}).edit(function(__, state){
  var user, def, nuser, key, value;
  user = state.user, def = state.def;
  nuser = {};
  for (key in user) {
    value = user[key];
    nuser[key] = R.mergeDeepWith(mergeF, def, value);
  }
  state.user = nuser;
  state.origin = void 8;
  return state;
}).cont(reg.core);
vre = /(\s*#\s*){0,1}(\s*)(\S*):/;
yaml_tokenize = function(data){
  var lines, all, i$, len$, I, torna, __, iscommeted, spaces, name, asbool, acc, temp, to$, current;
  lines = data.split("\n");
  all = [];
  for (i$ = 0, len$ = lines.length; i$ < len$; ++i$) {
    I = lines[i$];
    torna = vre.exec(I);
    if (!(torna === null)) {
      __ = torna[0], iscommeted = torna[1], spaces = torna[2], name = torna[3];
      asbool = be.not.undef.auth(iscommeted)['continue'];
      all.push({
        name: name,
        iscommeted: asbool,
        nodec: false,
        txt: I,
        space: spaces.length
      });
    } else {
      all.push({
        nodec: true,
        space: 0,
        txt: I
      });
    }
  }
  acc = [];
  temp = [];
  for (i$ = 0, to$ = all.length; i$ < to$; ++i$) {
    I = i$;
    current = all[I];
    if (!current.nodec && current.space === 0) {
      if (I > 0) {
        acc.push(temp);
      }
      temp = [current];
    } else {
      temp.push(current);
    }
  }
  acc.push(temp);
  return acc;
};
vars = {};
vars.get = function(tokens){
  var index, I, all, current, K, edit;
  index = null;
  I = 0;
  all = [];
  while (I < tokens.length) {
    current = tokens[I];
    if (current[0].name === 'global') {
      index = I;
      K = 0;
      while (K < current.length) {
        edit = [];
        do {
          edit.push(current[K]);
          K += 1;
        } while (K < current.length && current[K].nodec);
        all.push(edit);
      }
    }
    I += 1;
  }
  return [index, all];
};
isref = /\s*\w*:\s*(&\w+\s*){0,1}/;
vars.edit = function(arg$, vars, tokens){
  var index, all, name, txt, i$, to$, I, current, firstline, isr, old_txt;
  index = arg$[0], all = arg$[1];
  for (name in vars) {
    txt = vars[name];
    for (i$ = 1, to$ = all.length; i$ < to$; ++i$) {
      I = i$;
      current = all[I];
      if (current[0].name === name) {
        firstline = current[0];
        isr = isref.exec(firstline.txt);
        old_txt = current[0].txt;
        current[0].txt = isr[0] + " " + txt;
        all[I] = [current[0]];
      }
    }
  }
  if (index) {
    tokens[index] = R.flatten(all);
  }
  return tokens;
};
vars.stringify = function(tokens){
  var str, i$, len$, I;
  str = "";
  for (i$ = 0, len$ = tokens.length; i$ < len$; ++i$) {
    I = tokens[i$];
    str += I.txt + '\n';
  }
  return str;
};
entry = function(info){
  var FILENAME, data, tokens, torna, yaml_text, $, Er;
  try {
    FILENAME = process.cwd() + "/" + info.filename;
    data = R.toString(
    fs.readFileSync(
    FILENAME));
    tokens = yaml_tokenize(data);
    torna = vars.get(tokens);
    torna = vars.edit(torna, info.vars, tokens);
    torna = R.flatten(torna);
    yaml_text = vars.stringify(torna);
    $ = most_create(function(add, end, error){
      return tampax.yamlParseString(yaml_text, (import$({}, info.vars)), function(err, rawJson){
        var state;
        if (err) {
          l(err);
          print.failed_in_tampex_parsing(info.filename);
          return;
        }
        state = {
          commandline: info.commandline,
          options: info.options,
          filename: info.filename,
          cmd: info.cmd,
          origin: rawJson,
          def: {},
          user: {}
        };
        return add(ME.main.auth(state, state));
      });
    });
    return $;
  } catch (e$) {
    Er = e$;
    print.unableToReadConfigYaml(info.filename);
    l(Er);
    return most.empty();
  }
};
entry.findfile = ME.findfile;
reg.validator = entry;
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}