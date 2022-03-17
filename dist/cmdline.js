#!/usr/bin/env node

var ref$, global_data, com, print, readJson, most, j, exec, chokidar, most_create, fs, metadata, optionParser, tampax, readline, dotpat, spawn, yaml, compare_version, boxen, l, z, zj, R, lit, c, wait, noop, be, homedir, CONFIG_FILE_NAME, cmd_data, question_init, init, rest, str, silent, edit, isvar, vars, args, modyaml, nPromise, rmdef, only_str, tampax_parse, V, mergeArray, defarg_main, unu, is_false, is_true, rsync_arr2obj, ifrsh, organize_rsync, def_ssh, zero, check_if_empty, create_logger, update, init_continuation, arrToStr, create_rsync_cmd, execFinale, exec_rsync, bko, check_if_remote_needed, check_if_remotehost_present, check_if_remotedir_present, remote_main_proc, onchange, diff, ms_empty, handle_inf, resolve_signal, print_final_message, ms_create_watch, restart, check_conf_file, get_all, main, slice$ = [].slice, arrayFrom$ = Array.from || function(x){return slice$.call(x);};
ref$ = require("./data"), global_data = ref$.global_data, com = ref$.com, print = ref$.print;
readJson = com.readJson, most = com.most, j = com.j, exec = com.exec, chokidar = com.chokidar, most_create = com.most_create, fs = com.fs, metadata = com.metadata, optionParser = com.optionParser, tampax = com.tampax, readline = com.readline;
dotpat = com.dotpat, spawn = com.spawn, yaml = com.yaml, compare_version = com.compare_version, boxen = com.boxen;
ref$ = com.hoplon.utils, l = ref$.l, z = ref$.z, zj = ref$.zj, j = ref$.j, R = ref$.R, lit = ref$.lit, c = ref$.c, wait = ref$.wait, noop = ref$.noop;
be = com.hoplon.types;
homedir = require('os').homedir();
CONFIG_FILE_NAME = '.remotemon.yaml';
cmd_data = new optionParser();
cmd_data.addOption('h', 'help', null, 'help');
cmd_data.addOption('v', 'verbose', null, 'verbose');
cmd_data.addOption('V', 'version', null, 'version');
cmd_data.addOption('d', 'dry-run', null, 'dryRun');
cmd_data.addOption('w', 'watch-config-file', null, 'watch_config_file');
cmd_data.addOption('l', 'list', null, 'list');
cmd_data.addOption('m', 'auto-make-directory', null, 'auto_make_directory');
cmd_data.addOption('n', 'no-watch', null, 'no_watch');
cmd_data.addOption('s', 'silent', null, 'silent');
cmd_data.addOption('e', 'edit', null, 'edit');
cmd_data.addOption('p', 'project', null, 'project').argument('PROJECT');
question_init = function(){
  var rl, out;
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  out = {};
  out.ask = function*(str){
    return (yield new Promise(function(resolve, reject){
      return rl.question(str, function(user){
        return resolve(user);
      });
    }));
  };
  out.close = function(){
    return rl.close();
  };
  return out;
};
if (!metadata.name) {
  return false;
}
init = function*(){
  var configDirExists, cfolder, rmConfigFileExists, config_yaml_text, doc, service_dir, edit_config_file, q, str, ref$, str1, str2, lastchecktime, current_version_number, epoc, time_in_seconds, re, raw, ret, vn, corde, doc_as_json;
  configDirExists = fs.existsSync(homedir + "/.config");
  cfolder = homedir + "/.config/config.remotemon.yaml";
  rmConfigFileExists = fs.existsSync(cfolder);
  if (!configDirExists) {
    exec("mkdir " + homedir + "/.config");
  }
  if (!rmConfigFileExists) {
    exec("cp ./src/config.remotemon.yaml " + homedir + "/.config/");
  }
  config_yaml_text = fs.readFileSync(homedir + "/.config/config.remotemon.yaml").toString();
  doc = yaml.parseDocument(config_yaml_text);
  service_dir = doc.getIn(['service_directory']);
  edit_config_file = false;
  if (!service_dir) {
    q = question_init();
    str = c.er1("[" + metadata.name + "] service directory path : ");
    service_dir = (yield* q.ask(str));
    if (!((ref$ = R.last(service_dir)) === "/" || ref$ === "\\")) {
      service_dir = service_dir + "/";
    }
    doc.setIn(['service_directory'], service_dir);
    edit_config_file = true;
    str1 = c.grey("service directory is set to " + c.warn(service_dir));
    str2 = c.grey("can be changed anytime by editing ") + c.warn(homedir + "/.config/config.remotemon.yaml");
    l(str1);
    l(str2);
    q.close();
  } else {
    if (!((ref$ = R.last(service_dir)) === "/" || ref$ === "\\")) {
      service_dir = service_dir + "/";
      doc.setIn(['service_directory'], service_dir);
      edit_config_file = true;
    }
  }
  lastchecktime = doc.getIn(['last_check_time']);
  current_version_number = doc.getIn(['current_version_number']);
  epoc = Date.now() / 1000;
  time_in_seconds = 1 * 24 * 60 * 60;
  re = /.*latest.*: (.*)/gm;
  if (lastchecktime === 0) {
    doc.setIn(['last_check_time'], epoc);
    edit_config_file = true;
  }
  if (epoc - lastchecktime > time_in_seconds) {
    raw = exec("npm view " + metadata.name);
    ret = re.exec(raw);
    vn = ret[1];
    if (compare_version(metadata.version, vn) === 1) {
      doc.setIn(['last_check_time'], epoc);
      edit_config_file = true;
      process.on('exit', function(){
        var msg;
        msg = "update available " + c.er2(vn) + c.ok((" ➝ " + metadata.version) + "\n" + c.warn("npm i -g remotemon"));
        return console.log(boxen(msg, {
          padding: 1,
          borderColor: "green",
          textAlignment: "center"
        }));
      });
    }
  }
  corde = yaml.stringify(doc);
  if (edit_config_file) {
    fs.writeFileSync(cfolder, corde);
  }
  doc_as_json = doc.toJSON();
  return (yield doc_as_json);
};
rest = cmd_data.parse();
if (cmd_data.help.count() > 0) {
  str = "" + metadata.name + " version " + metadata.version + "\n\noptions:\n\n  -v --verbose               more detail\n\n  -vv                        much more detail\n\n  -h --help                  display help message\n\n  -V --version               displays version number\n\n  -d --dry-run               perform a trial run without making any changes\n\n  -w --watch-config-file     restart on config file change\n\n  -l --list                  list all user commands\n\n  -m --auto-make-directory   make remote directory if it doesn't exist ( with user permission )\n\n     -mm                     ( with root permission )\n\n  -n --no-watch              force disable any and all watches\n\n  -s --silent                do not show " + metadata.name + " messages\n\n  -e --edit                  make permanent edits to " + CONFIG_FILE_NAME + " values\n\n  -p --project               folder name to look for " + CONFIG_FILE_NAME + "\n\n  ---- shorthands ----\n\n  CF <-- for configuration file\n\nvalues for internal variables (using .global object) can be changed using '=' (similar to makefiles) :\n\n> " + metadata.name + " --verbose file=dist/main.js\n\n[ documentation ] @ [ " + metadata.homepage + " ]\n";
  l(str);
  return;
}
silent = cmd_data.silent.count();
edit = cmd_data.edit.count();
if (cmd_data.version.count() > 0) {
  l(c.er1("[" + metadata.name + "] version " + metadata.version));
  return;
}
isvar = R.test(/^[\.\w]+=/);
vars = R.map(R.pipe(R.split('='), R.over(R.lensIndex(0), R.pipe(R.split("/"), function(key){
  var name;
  if (key.length === 1) {
    name = key[0];
    if (!global_data.selected_keys.set.has(name)) {
      key.unshift("global");
    }
    return key;
  }
  return key;
})), R.over(R.lensIndex(1), function(str_data){
  var isnum;
  switch (str_data) {
  case 'True':
  case 'true':
    return true;
  case 'False':
  case 'false':
    return false;
  }
  isnum = parseFloat(str_data);
  if (!deepEq$(isnum, NaN, '===')) {
    return isnum;
  }
  return str_data;
})))(
R.filter(isvar)(
rest));
args = R.reject(isvar, rest);
modyaml = function(info){
  var data, doc, vars, i$, len$, ref$, key, value;
  data = R.toString(
  fs.readFileSync(
  info.configfile));
  doc = yaml.parseDocument(data);
  vars = info.vars;
  for (i$ = 0, len$ = vars.length; i$ < len$; ++i$) {
    ref$ = vars[i$], key = ref$[0], value = ref$[1];
    doc.setIn(key, value);
  }
  return String(doc);
};
nPromise = function(f){
  return new Promise(f);
};
rmdef = R.reject(function(x){
  return global_data.selected_keys.set.has(x);
});
only_str = be.str.cont(function(str){
  return " - " + str;
}).or(be.arr.cont(function(arr){
  var fin, i$, len$, I;
  fin = "";
  for (i$ = 0, len$ = arr.length; i$ < len$; ++i$) {
    I = arr[i$];
    fin += "\n    - " + I;
  }
  return fin;
})).fix("").wrap();
function exec_list_option(yjson, info){
  var keys, user_ones, i$, to$, I, name, des, results$ = [];
  l(lit(['> FILE ', info.configfile], [c.warn, c.pink]));
  keys = Object.keys(yjson);
  user_ones = rmdef(keys);
  if (user_ones.length === 0) {
    l(lit(["  --- ", "< EMPTY >", " ---"], [c.pink, c.warn, c.pink]));
  }
  for (i$ = 0, to$ = user_ones.length; i$ < to$; ++i$) {
    I = i$;
    name = user_ones[I];
    des = only_str(yjson[name].description);
    results$.push(l(lit([" • ", name, des], [c.warn, c.ok, null])));
  }
  return results$;
}
tampax_parse = function(yaml_text, cmdargs, filename){
  return nPromise(function(resolve, reject){
    return tampax.yamlParseString(yaml_text, arrayFrom$(cmdargs), function(err, rawjson){
      if (err) {
        print.failed_in_tampax_parsing(filename, err);
        resolve('error.validator.tampaxparsing');
        return;
      }
      return resolve(rawjson);
    });
  });
};
V = {};
mergeArray = function(deflength, def, arr){
  var tail, len, rest, fin, i$, I;
  tail = def[def.length - 1];
  if (tail === Infinity) {
    len = def.length - 1;
    rest = arr.splice(len, arr.length);
    if (rest.length > 0) {
      rest = [rest.join(" ")];
    }
    arr = arrayFrom$(arr).concat(arrayFrom$(rest));
    def[len] = '';
  }
  fin = [];
  for (i$ = 0; i$ < deflength; ++i$) {
    I = i$;
    if (arr[I] === undefined && def[I] === undefined) {
      break;
    } else if (arr[I] === undefined) {
      fin[I] = def[I];
    } else {
      fin[I] = arr[I];
    }
  }
  return fin;
};
defarg_main = be.undefnull.cont(function(){
  var state;
  state = arguments[arguments.length - 1];
  return ['arr', state.cmdargs.length, []];
}).alt(be.arr.cont(function(arr){
  var state, len;
  state = arguments[arguments.length - 1];
  len = R.max(arr.length, state.cmdargs.length);
  return ['arr', len, arr];
})).alt(be.str.cont(function(str){
  var state, len;
  state = arguments[arguments.length - 1];
  len = R.max(1, state.cmdargs.length);
  return ['arr', len, [str]];
})).or(be(function(x){
  return x === Infinity;
}).cont(function(){
  var state, data;
  state = arguments[arguments.length - 1];
  data = state.cmdargs.join(" ");
  return ['arr', 1, [data]];
})).alt(be.int.pos.cont(function(num){
  var state, len;
  state = arguments[arguments.length - 1];
  len = R.max(num, state.cmdargs.length);
  return ['req', len, []];
})).err([':defarg.type', 'is not of type array / str / int.pos']);
V.defarg = defarg_main.cont(function(data){
  var state, __, len, list;
  state = arguments[arguments.length - 1];
  __ = data[0], len = data[1], list = data[2];
  data[2] = mergeArray(len, data[2], state.cmdargs);
  return data;
}).and(function(impdefarg){
  var info, type, len, list;
  info = arguments[arguments.length - 1];
  type = impdefarg[0], len = impdefarg[1], list = impdefarg[2];
  if (type === 'req' && len > list.length) {
    return [false, [':defarg.req', len]];
  }
  return true;
}).err(function(E){
  var info, path, type, msg, F;
  info = arguments[arguments.length - 1];
  path = ['defarg'];
  if (info.cmdname) {
    path.unshift(info.cmdname);
  }
  type = E[0], msg = E[1];
  F = (function(){
    switch (type) {
    case ':defarg.req':
      return print.defarg_req;
    case ':defarg.type':
      return print.basicError;
    default:
      return print.basicError;
    }
  }());
  return F(msg, path, info.cmd_filename);
});
unu = be.undefnull.cont(void 8);
V.rsl = be.arr.cont(R.flatten).map(be.str.or(be.obj.and(function(obj){
  var keys;
  keys = Object.keys(obj);
  switch (keys.length) {
  case 0:
    return [false, [':ob_in_str_list', 'empty_object']];
  default:
    return [false, [':ob_in_str_list', 'object']];
  }
})).or(unu)).alt(be.str.cont(function(x){
  return [x];
})).err(function(all){
  var msg, type;
  msg = be.flatro(all)[0];
  type = msg[0];
  switch (type) {
  case ':ob_in_str_list':
    return msg;
  }
  return "not string or string list.";
}).cont(R.without([void 8]));
V.strlist = function(F){
  return V.rsl.or(be.undefnull.cont(F));
};
V.strlist.empty = V.strlist(function(){
  return [];
});
V.strlist.dot = V.strlist(function(){
  return ["."];
});
V.strlist['false'] = V.strlist(false);
is_false = function(x){
  if (x === false) {
    return true;
  }
  return [false, 'not false'];
};
is_true = function(x){
  if (x === true) {
    return true;
  }
  return [false, 'not true'];
};
V.isFalse = be(is_false);
V.isTrue = be(is_true);
V.watch = {};
V.watch.main = V.rsl.or(V.isFalse.cont(function(){
  return [];
}));
V.watch.def = V.watch.main.or(be.undefnull.cont(["."])).or(V.isTrue.cont(["."]));
V.watch.user = V.watch.main.or(unu).or(V.isTrue.cont(void 8));
V.ignore = {};
V.ignore.def = V.rsl.or(be.undefnull.cont([])).or(V.isFalse.cont(function(){
  return [];
}));
V.ignore.user = V.rsl.or(unu);
V.execlist = V.strlist.empty.cont(function(strlist){
  var fin, i$, len$, str, nstr;
  fin = [];
  for (i$ = 0, len$ = strlist.length; i$ < len$; ++i$) {
    str = strlist[i$];
    nstr = str.replace(/'/g, "'''");
    fin.push(nstr);
  }
  return fin;
});
V.str2arr = be.arr.map(be.str).or(be.str.cont(function(str){
  return [str];
})).or(be.undefnull.cont(function(){
  return [];
}));
V.rsync = {};
V.rsync.throw_if_error = function(data){
  var rsync, ref$, msg, index, tosend;
  rsync = data.rsync;
  if (rsync === false) {
    return true;
  }
  if (rsync.error) {
    ref$ = rsync.error, msg = ref$[0], index = ref$[1];
    tosend = [false, [':rsync', msg], ['rsync'].concat(arrayFrom$(index))];
    return tosend;
  }
  return true;
};
rsync_arr2obj = function(data, cmdname, remotefold){
  var fin, error, list, i$, len$, index, I, keys, k, val, ret, ref$;
  fin = {
    str: [],
    obnormal: [],
    obarr: {},
    des: null,
    src: [],
    error: false
  };
  error = [];
  list = R.flatten(data);
  for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
    index = i$;
    I = list[i$];
    switch (R.type(I)) {
    case 'String':
      if (!global_data.rsync.bool.has(I)) {
        error.push(['duo', [I, "not a valid boolean rsync option."]], [index]);
        fin.error = error;
        return fin;
      }
      fin.str.push(I);
      break;
    case 'Object':
      keys = Object.keys(I);
      switch (keys.length) {
      case 0:
        error.push(['uno', ["empty object without any attribute"]], [index]);
        fin.error = error;
        return fin;
      case 1:
        break;
      default:
        error.push(['uno', ["object can only have singular attribute."]], [index]);
        fin.error = error;
        return fin;
      }
      k = keys[0];
      if (!(global_data.rsync.compound.has(k) || (k === 'src' || k === 'des'))) {
        error.push(['duo', [k, " not a valid compound rsync option."]], [index]);
        fin.error = error;
        return fin;
      }
      val = I[k];
      if (k === 'des') {
        if (!(R.type(val) === 'String')) {
          error.push(['duo', ['des', " has to be string type."]], [index]);
          fin.error = error;
          return fin;
        }
        if (fin.des) {
          error.push(['duo', ['des', " there can't be multiple remote folders as destination."]], [index]);
          fin.error = error;
          return fin;
        }
        fin.des = val;
      } else if (k === 'src' || global_data.rsync.filter.has(k)) {
        ret = V.str2arr.auth(val);
        if (ret.error) {
          error.push(['duo', [k, "can only be a list of string or just string."]], [index].concat(arrayFrom$(ret.path)));
          fin.error = error;
          return fin;
        }
        if (k === 'src') {
          fin.src.push(ret.value);
        } else {
          if (fin.obarr[k] === undefined) {
            fin.obarr[k] = [];
          }
          (ref$ = fin.obarr[k]).push.apply(ref$, ret.value);
        }
      } else {
        switch (R.type(val)) {
        case 'String':
        case 'Number':
          fin.obnormal.push([k, val.replace(/'/g, "'\\''")]);
          break;
        case 'Undefined':
        case 'Null':
          break;
        default:
          error.push(['duo', [k, "can only be a string (or number)."]], [index]);
          fin.error = error;
          return fin;
        }
      }
      break;
    default:
      error.push(['uno', ["not valid rsync option."]], [index]);
      fin.error = error;
      return fin;
    }
  }
  fin.src = R.flatten(fin.src);
  if (!fin.des) {
    fin.des = remotefold;
  }
  if (fin.src.length === 0) {
    fin.src.push(".");
  }
  return fin;
};
ifrsh = function(arg$){
  var key;
  key = arg$[0];
  return key === 'rsh';
};
organize_rsync = function(data, cmdname){
  var state, rsync, remotefold, add, fin, i$, to$, I, st, ref$, len$, obnormal, ssh;
  state = arguments[arguments.length - 1];
  rsync = data.rsync, remotefold = data.remotefold;
  if (rsync === false) {
    return data;
  }
  if (rsync === true) {
    add = [{
      des: remotefold
    }];
    rsync = [state.info.options.rsync.concat(add)];
  }
  fin = [];
  for (i$ = 0, to$ = rsync.length; i$ < to$; ++i$) {
    I = i$;
    st = rsync_arr2obj(rsync[I], cmdname, remotefold);
    if (st.error) {
      st.error[1].unshift(I);
      data.rsync = st;
      return data;
    } else {
      fin.push(st);
    }
  }
  data.rsync = fin;
  for (i$ = 0, len$ = (ref$ = data.rsync).length; i$ < len$; ++i$) {
    obnormal = ref$[i$].obnormal;
    if (!R.find(ifrsh, obnormal)) {
      if (data.ssh) {
        ssh = [['rsh', "ssh " + data.ssh]];
      } else if (state.origin.ssh) {
        ssh = [['rsh', "ssh " + state.origin.ssh]];
      } else {
        ssh = [];
      }
      obnormal.push.apply(obnormal, ssh);
    }
  }
  return data;
};
V.rsync.init = be.bool.or(be.undefnull.cont(false)).or(be.arr.map(be.arr).err(function(msg, key){
  switch (key) {
  case undefined:
    return [':rsync_top', 'not array'];
  default:
    return ['not_array_of_array', key];
  }
})).or(be.arr.cont(function(a){
  return [a];
}));
V.user = be.obj.or(be.undefnull.cont(function(){
  return {};
})).and(be.restricted(global_data.selected_keys.arr)).alt(V.strlist.empty.cont(function(list){
  return {
    'local': list
  };
})).err("custom user defined task, has to be object.").on(['initialize', 'inpwd', 'silent'], be.bool.or(unu)).on('watch', V.watch.user).on('verbose', be.num.or(unu)).on('ignore', V.ignore.user).on(['pre', 'remote', 'local', 'final'], V.execlist).on('rsync', V.rsync.init).on(['remotehost', 'remotefold'], be.str.or(unu.cont(function(v, key){
  var origin;
  origin = arguments[arguments.length - 1].origin;
  return origin[key];
}))).cont(organize_rsync).and(V.rsync.throw_if_error).on('ssh', be.str.or(unu));
def_ssh = be.str.or(be.undefnull.cont(function(){
  var info;
  info = arguments[arguments.length - 1].info;
  return info.options.ssh;
}));
V.def = be.obj.on(['remotehost', 'remotefold'], be.str.or(unu)).on(['inpwd', 'silent'], be.bool.or(be.undefnull.cont(false))).on('verbose', be.num.or(unu.cont(0))).on('initialize', be.bool.or(be.undefnull.cont(true))).on('watch', V.watch.def).on('ignore', V.ignore.def).on(['pre', 'local', 'final', 'remote'], V.execlist).on('rsync', V.rsync.init).cont(organize_rsync).and(V.rsync.throw_if_error).on('ssh', def_ssh).map(function(value, key){
  var state, def, user, put;
  state = arguments[arguments.length - 1];
  def = state.def, user = state.user;
  switch (global_data.selected_keys.set.has(key)) {
  case true:
    def[key] = value;
    break;
  case false:
    if (key.match("/")) {
      return [false, [':incorrect-custom-name']];
    }
    put = V.user.auth(value, key, state);
    if (put['continue']) {
      user[key] = put.value;
    } else {
      return [false, [put.message], put.path];
    }
  }
  return true;
}).cont(function(){
  var ref$, user, def, cmdname, value, i$, len$, I;
  ref$ = arguments[arguments.length - 1], user = ref$.user, def = ref$.def;
  for (cmdname in user) {
    value = user[cmdname];
    for (i$ = 0, len$ = (ref$ = global_data.selected_keys.undef).length; i$ < len$; ++i$) {
      I = ref$[i$];
      if (value[I] === undefined) {
        user[cmdname][I] = def[I];
      } else {
        user[cmdname][I] = value[I];
      }
    }
  }
  return {
    user: user,
    def: def
  };
}).err(function(message, path){
  var info, topmsg, loc, Error, F;
  info = arguments[arguments.length - 1].info;
  topmsg = be.flatro(message)[0];
  loc = topmsg[0], Error = topmsg[1];
  F = (function(){
    switch (loc) {
    case ':in_selected_key':
      return print.in_selected_key;
    case ':res':
      return print.resError;
    case ':rsync':
      return print.rsyncError;
    case ':ob_in_str_list':
      return print.ob_in_str_list;
    case ':rsync_top':
      return print.basicError;
    case ':incorrect-custom-name':
      return print.incorrect_custom;
    default:
      Error = message[0];
      return print.basicError;
    }
  }());
  F(Error, path, info.cmd_filename);
});
zero = function(arr){
  return arr.length === 0;
};
check_if_empty = be.known.obj.on(['pre', 'local', 'final', 'remote'], zero).on('rsync', be.arr.and(zero).or(V.isFalse)).cont(true).fix(false).wrap();
create_logger = function(info, gconfig){
  var cmdname, lconfig, buildname, verbose, silent, log;
  cmdname = info.cmdname;
  if (cmdname === undefined) {
    lconfig = gconfig.def;
    buildname = "";
  } else {
    lconfig = gconfig.user[cmdname];
    buildname = info.cmdname;
  }
  if (lconfig.verbose) {
    verbose = lconfig.verbose;
  } else {
    verbose = info.options.verbose;
  }
  silent = lconfig.silent || info.options.silent;
  log = print.create_logger(buildname, verbose, silent);
  return [lconfig, log, buildname];
};
update = function*(lconfig, yaml_text, info){
  var defarg, ref$, args, origin, vout, gconfig, log, buildname;
  defarg = V.defarg.auth(lconfig.defarg, info);
  if (defarg.error) {
    return 'error';
  }
  ref$ = defarg.value, args = ref$[ref$.length - 1];
  origin = (yield tampax_parse(yaml_text, args, info.configfile));
  vout = V.def.auth(origin, {
    def: {},
    user: {},
    origin: origin,
    info: info
  });
  if (vout.error) {
    return 'error';
  }
  gconfig = vout.value;
  ref$ = create_logger(info, gconfig), lconfig = ref$[0], log = ref$[1], buildname = ref$[2];
  if (info.options.watch_config_file) {
    lconfig.watch.unshift(info.configfile);
  }
  return [lconfig, log, buildname];
};
init_continuation = function(dryRun, dir, inpwd){
  return function*(cmd, type){
    var status;
    type == null && (type = 'async');
    if (dryRun) {
      status = 0;
    } else {
      status = spawn(cmd, dir, inpwd).status;
    }
    if (status !== 0) {
      switch (type) {
      case 'async':
        (yield new Promise(function(resolve, reject){
          return reject([cmd]);
        }));
        break;
      case 'sync':
        return [cmd];
      }
    }
    return 'ok';
  };
};
arrToStr = function(arr){
  var gap;
  gap = (function(){
    switch (arr.length) {
    case 0:
      return "";
    case 1:
      return " ";
    default:
      return " ";
    }
  }());
  return arr.join(" ") + gap;
};
create_rsync_cmd = function(rsync, remotehost){
  var txt, str, obnormal, obarr, des, src, i$, len$, I, ref$, key, val, cmd;
  txt = "";
  str = rsync.str, obnormal = rsync.obnormal, obarr = rsync.obarr, des = rsync.des, src = rsync.src;
  for (i$ = 0, len$ = str.length; i$ < len$; ++i$) {
    I = str[i$];
    txt += "--" + I + " ";
  }
  for (i$ = 0, len$ = obnormal.length; i$ < len$; ++i$) {
    ref$ = obnormal[i$], key = ref$[0], val = ref$[1];
    txt += "--" + key + "='" + val + "' ";
  }
  for (key in obarr) {
    val = obarr[key];
    txt += ("--" + key + "={") + (fn$()).join(',') + "} ";
  }
  cmd = "rsync " + txt + arrToStr(src) + (remotehost + ":" + des);
  return cmd;
  function fn$(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = val).length; i$ < len$; ++i$) {
      I = ref$[i$];
      results$.push("'" + I + "'");
    }
    return results$;
  }
};
execFinale = function*(data){
  var info, lconfig, log, cont, postscript, i$, len$, cmd, results$ = [];
  info = data.info, lconfig = data.lconfig, log = data.log, cont = data.cont;
  postscript = lconfig['final'];
  log.normal(postscript.length, 'ok', " final", c.warn(postscript.length + ""));
  for (i$ = 0, len$ = postscript.length; i$ < len$; ++i$) {
    cmd = postscript[i$];
    log.verbose(cmd);
    results$.push((yield* cont(cmd)));
  }
  return results$;
};
exec_rsync = function*(data, each){
  var info, lconfig, log, cont, remotehost, remotefold, cmd, disp, status;
  info = data.info, lconfig = data.lconfig, log = data.log, cont = data.cont;
  remotehost = lconfig.remotehost, remotefold = lconfig.remotefold;
  cmd = create_rsync_cmd(each, remotehost);
  disp = lit([remotehost + ":" + each.des, c.warn(" <- "), each.src.join(" , ")], [c.grey, c.warn, c.grey]);
  log.normal(true, 'ok', lit(["sync", " start"], [0, c.warn]), c.grey(disp));
  log.verbose("rsync ... ", cmd);
  status = (yield* cont(cmd, 'sync'));
  if (status !== 'ok') {
    log.normal('err_light', lit(["sync", " break"], [c.pink, c.er2]), "");
    return (yield nPromise(function(resolve, reject){
      return reject(status);
    }));
  } else {
    return log.normal(true, 'ok', lit(["sync ", "✔️ ok"], [0, c.ok]), "");
  }
};
bko = be.known.obj;
check_if_remote_needed = bko.on('remotehost', be.undef).or(bko.on('remotefold', be.undef)).and(bko.on('remote', be.not(zero)).or(bko.on('rsync', be.not(V.isFalse)))).cont(true).fix(false).wrap();
check_if_remotehost_present = function*(data){
  var lconfig, log, cont, tryToSSH, E;
  lconfig = data.lconfig, log = data.log, cont = data.cont;
  tryToSSH = "ssh " + lconfig.ssh + " " + lconfig.remotehost + " 'ls'";
  try {
    exec(tryToSSH);
  } catch (e$) {
    E = e$;
    log.normal('err', lit(["unable to ssh to remote address ", lconfig.remotehost, "."], [c.er1, c.er2, c.er1]));
    (yield nPromise(function(resolve, reject){
      return reject('error');
    }));
  }
};
check_if_remotedir_present = function*(data){
  var info, lconfig, log, cont, checkDir, E, userinput, ref$, cmd, msg, mkdir;
  info = data.info, lconfig = data.lconfig, log = data.log, cont = data.cont;
  checkDir = "ssh " + lconfig.ssh + " " + lconfig.remotehost + " 'ls " + lconfig.remotefold + "'";
  try {
    return exec(checkDir, info.options.dryRun);
  } catch (e$) {
    E = e$;
    if (info.options.auto_make_directory) {
      switch (info.options.auto_make_directory) {
      case 1:
        userinput = 'y';
        break;
      default:
        userinput = 'r';
      }
    } else {
      userinput = (yield new Promise(function(resolve, reject){
        var Q;
        Q = lit(["[" + metadata.name + "]", " " + lconfig.remotefold, " not on remote, create directory ", lconfig.remotehost + ":" + lconfig.remotefold, " ? [r (as root)|y (as user)|n] "], [c.ok, c.warn, c.grey, c.warn, c.grey]);
        return lconfig.rl.question(Q, function(input){
          switch (input) {
          case 'y':
          case 'Y':
            resolve('y');
            break;
          case 'r':
          case 'R':
            resolve('r');
            break;
          default:
            log.normal('err', "remote", lit(["cannot continue remote without remotefolder ", lconfig.remotefold, "."], [c.er1, c.warn, c.er1, c.er1]));
            reject('error');
          }
        });
      }));
    }
    if (userinput) {
      ref$ = (yield* (function*(){
        switch (userinput) {
        case 'y':
          return ["mkdir", "user"];
        case 'r':
          return ["sudo mkdir", "root"];
        }
      }())), cmd = ref$[0], msg = ref$[1];
      mkdir = "ssh " + lconfig.ssh + " " + lconfig.remotehost + " '" + cmd + " " + lconfig.remotefold + "'";
      (yield* cont(mkdir));
      return log.normal('ok', "remote", lit([' ✔️ ok •', " " + lconfig.remotehost + ":" + lconfig.remotefold + " ", "created with ", msg + "", " permissions."], [c.ok, c.warn, c.grey, c.ok, c.grey]));
    }
  }
};
remote_main_proc = function*(data, remotetask){
  var lconfig, log, cont, info, remotehost, remotefold, disp, i$, len$, I, cmd, results$ = [];
  lconfig = data.lconfig, log = data.log, cont = data.cont, info = data.info;
  remotehost = lconfig.remotehost, remotefold = lconfig.remotefold;
  disp = lit([remotetask.length + " ", "• ", remotehost + ":" + remotefold], [c.warn, c.ok, c.grey]);
  log.normal(remotetask.length, 'ok', "remote", disp);
  for (i$ = 0, len$ = remotetask.length; i$ < len$; ++i$) {
    I = remotetask[i$];
    cmd = ("ssh " + lconfig.ssh + " ") + remotehost + " '" + ("cd " + remotefold + ";") + I + "'";
    log.verbose(I, cmd);
    results$.push((yield* cont(cmd)));
  }
  return results$;
};
onchange = function*(data){
  var info, lconfig, log, cont, remotehost, remotefold, local, remotetask, i$, len$, cmd, ref$, each;
  info = data.info, lconfig = data.lconfig, log = data.log, cont = data.cont;
  if (check_if_remote_needed(lconfig)) {
    log.normal('err', " ⚡️⚡️ error", c.er2(".remotehost/.remotefold ( required for task ) not defined."));
    (yield 'error');
    return;
  }
  if (check_if_empty(lconfig)) {
    log.normal('err', " ⚡️⚡️ error", c.er1("empty execution, no user command to execute."));
    (yield 'error');
    return;
  }
  remotehost = lconfig.remotehost, remotefold = lconfig.remotefold;
  local = lconfig.local;
  remotetask = lconfig.remote;
  log.normal(local.length, 'ok', "local", c.warn(local.length + ""));
  for (i$ = 0, len$ = local.length; i$ < len$; ++i$) {
    cmd = local[i$];
    log.verbose(cmd);
    (yield* cont(cmd));
  }
  if (lconfig.rsync || (remotetask.length && !info.options.dryRun)) {
    (yield* check_if_remotehost_present(data));
  }
  if (lconfig.rsync) {
    for (i$ = 0, len$ = (ref$ = lconfig.rsync).length; i$ < len$; ++i$) {
      each = ref$[i$];
      (yield* exec_rsync(data, each));
    }
  }
  if (remotetask.length) {
    if (!info.options.dryRun) {
      (yield* check_if_remotedir_present(data));
    }
    (yield* remote_main_proc(data, remotetask));
  }
  (yield* execFinale(data));
  (yield 'done');
};
diff = R.pipe(R.aperture(2), R.map(function(arg$){
  var x, y;
  x = arg$[0], y = arg$[1];
  return y - x;
}));
ms_empty = most.empty();
handle_inf = function(log, lconfig){
  return function(db, ob){
    var time_bin_size, ref$, first, second, fin;
    db.shift();
    time_bin_size = 500;
    db.push(Math.floor(ob.time / time_bin_size));
    ref$ = diff(db), first = ref$[0], second = ref$[1];
    fin = {
      seed: db
    };
    if (first === second) {
      fin.value = ['err', ob.value];
      log.normal('err', " ⚡️⚡️ error", c.er1("infinite loop detected ") + c.warn(ob.value) + c.er1(" is offending file, ignoring event."));
      if (lconfig.watch.length > 0) {
        log.normal('err', " returing to watch ");
      }
      fin.value = ms_empty;
    } else {
      fin.value = most.just(ob.value);
    }
    return fin;
  };
};
resolve_signal = be.arr.on(0, be.str.fix('<< program screwed up >>').cont(function(cmd){
  cmd = cmd.replace(/'''/g, "'");
  if (cmd.split('\n').length > 1) {
    return '\n' + cmd;
  }
  if (cmd.length > 45) {
    return '\n' + cmd;
  } else {
    return cmd;
  }
})).cont(function(arg$, log, info){
  var cmdtxt;
  cmdtxt = arg$[0];
  process.stdout.cursorTo(0);
  if (info.options.verbose === 2) {
    log.normal('err_light', "exit 1", cmdtxt);
  } else {
    log.normal('err_light', "exit 1");
  }
  return 'error';
}).alt(be.str).wrap();
print_final_message = function(log, lconfig, info){
  return function(signal){
    var msg;
    signal = resolve_signal(signal, log, info);
    if (lconfig.watch.length === 0 || info.options.no_watch > 0) {
      lconfig.rl.close();
      return;
    }
    if (info.options.watch_config_file) {
      msg = c.warn("returning to watch ") + c.pink("*CF");
    } else {
      msg = c.warn("returning to watch");
    }
    switch (signal) {
    case 'error':
      log.normal('err', msg);
      break;
    case 'done':
      log.normal('ok', msg);
    }
  };
};
ms_create_watch = function*(lconfig, info, log){
  var should_I_watch, disp, I, ms_file_watch, cont, pre, i$, len$, cmd, ms;
  should_I_watch = lconfig.watch.length > 0 && info.options.no_watch === 0;
  if (should_I_watch) {
    disp = lconfig.watch;
    if (info.options.watch_config_file && disp.length > 0) {
      disp = R.drop(1, disp);
      disp.unshift(c.pink("CF"));
    }
    log.normal(should_I_watch, 'err_light', "watch", (yield* (function*(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = disp).length; i$ < len$; ++i$) {
        I = ref$[i$];
        results$.push(c.warn(I));
      }
      return results$;
    }())).join(" "));
    log.normal(should_I_watch && lconfig.ignore.length, 'err_light', "ignore", (yield* (function*(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = lconfig.ignore).length; i$ < len$; ++i$) {
        I = ref$[i$];
        results$.push(c.warn(I));
      }
      return results$;
    }())).join(" "));
  }
  ms_file_watch = most_create(function(add, end, error){
    var rl, cwd, watcher;
    if (lconfig.initialize) {
      add(null);
    }
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
    rl.on('line', function(input){
      process.stdout.write(input);
    });
    lconfig.rl = rl;
    if (lconfig.inpwd) {
      cwd = undefined;
    } else {
      cwd = "../" + info.options.project;
    }
    if (should_I_watch) {
      watcher = chokidar.watch(lconfig.watch, {
        awaitWriteFinish: true,
        ignored: lconfig.ignore,
        ignorePermissionErrors: true,
        cwd: cwd
      });
      watcher.on('change', add);
      return function(){
        watcher.close();
        rl.close();
        lconfig.rl = void 8;
        end();
      };
    }
  });
  cont = init_continuation(info.options.dryRun, info.options.project, lconfig.inpwd);
  pre = lconfig.pre;
  log.normal(pre.length, 'ok', "pre", c.warn(pre.length + ""));
  for (i$ = 0, len$ = pre.length; i$ < len$; ++i$) {
    cmd = pre[i$];
    log.verbose(cmd);
    (yield* cont(cmd));
  }
  ms = ms_file_watch.timestamp().loop(handle_inf(log, lconfig), info.timedata).switchLatest().takeWhile(function(filename){
    if (filename === CONFIG_FILE_NAME) {
      if (info.options.watch_config_file) {
        return false;
      }
    }
    return true;
  }).continueWith(function(filename){
    most.generate(restart, info, log, cont).drain();
    return most.empty();
  }).tap(function(filename){
    var data;
    data = {
      info: info,
      lconfig: lconfig,
      log: log,
      cont: cont
    };
    return most.generate(onchange, data).recoverWith(function(x){
      return most.just(x);
    }).tap(print_final_message(log, lconfig, info)).drain();
  });
  return ms.drain();
};
restart = function*(info, log){
  var msg, yaml_text, E, gconfig, lconfig, defarg, vari;
  msg = lit([info.configfile + "", " changed, restarting watch"], [c.warn, c.er1]);
  log.normal('err', msg);
  try {
    yaml_text = modyaml(info);
  } catch (e$) {
    E = e$;
    print.failed_in_mod_yaml(filename, E);
    return;
  }
  gconfig = (yield tampax_parse(yaml_text, info.cmdargs, info.configfile));
  if (gconfig === 'error.validator.tampaxparsing') {
    return;
  }
  if (info.cmdname) {
    lconfig = gconfig[info.cmdname];
    defarg = lconfig.defarg;
  } else {
    lconfig = gconfig;
    defarg = gconfig.defarg;
  }
  vari = (yield* update(lconfig, yaml_text, info));
  if (vari === 'error') {
    return;
  }
  lconfig = vari[0], log = vari[1];
  return most.generate(ms_create_watch, lconfig, info, log).drain();
};
V.CONF = be.known.obj.on('rsync', V.rsync.init).cont(organize_rsync).and(V.rsync.throw_if_error).err(function(message, path){
  var info, topmsg, loc, Error, F;
  info = arguments[arguments.length - 1];
  topmsg = be.flatro(message)[0];
  loc = topmsg[0], Error = topmsg[1];
  F = (function(){
    switch (loc) {
    case ':rsync':
      return print.rsyncError;
    }
  }());
  return F(Error, path, "~/.config/config.remotemon.yaml");
});
check_conf_file = function(conf, info){
  var D, x$, origin, Sortir;
  D = {};
  D.rsync = conf.rsync;
  D.ssh = conf.ssh;
  D.remotefold = '';
  x$ = origin = {};
  x$.ssh = conf.ssh;
  Sortir = V.CONF.auth(D, info.cmdname, {
    origin: origin,
    info: info
  });
  return Sortir.error;
};
get_all = function*(info){
  var yaml_text, E, yjson, found, lconfig, vari, log;
  try {
    yaml_text = modyaml(info);
    if (info.options.edit) {
      fs.writeFileSync(info.configfile, yaml_text);
      return;
    }
  } catch (e$) {
    E = e$;
    print.failed_in_mod_yaml(info.configfile, E);
    return;
  }
  yjson = (yield tampax_parse(yaml_text, info.cmdargs, info.configfile));
  if (yjson === 'error.validator.tampaxparsing') {
    return;
  }
  if (info.options.list) {
    exec_list_option(yjson, info);
    return;
  }
  if (info.cmdname) {
    if (global_data.selected_keys.set.has(info.cmdname)) {
      print.in_selected_key(info.cmdname, info.cmdline);
      return;
    }
    found = yjson[info.cmdname];
    if (!found) {
      print.could_not_find_custom_cmd(info.cmdname);
      return;
    }
    lconfig = yjson[info.cmdname];
  } else {
    lconfig = yjson;
  }
  vari = (yield* update(lconfig, yaml_text, info));
  if (vari === 'error') {
    return;
  }
  lconfig = vari[0], log = vari[1];
  log.dry('err', metadata.version);
  return most.generate(ms_create_watch, lconfig, info, log).recoverWith(function(sig){
    resolve_signal(sig, log, info);
    return most.empty();
  }).drain();
};
main = function(cmd_data){
  return function(CONF){
    var project_name, config_file_name, service_directory, wcf, x$, info, y$;
    project_name = cmd_data.project.value();
    if (!project_name) {
      config_file_name = "./" + CONFIG_FILE_NAME;
    } else {
      service_directory = CONF.service_directory;
      config_file_name = service_directory + project_name + "/" + CONFIG_FILE_NAME;
    }
    if (!fs.existsSync(config_file_name)) {
      l(c.er3("[" + metadata.name + "]"), c.er3("• Error •"), c.er1("project"), c.warn(project_name), c.er1("does not have a"), c.warn(CONFIG_FILE_NAME), c.er1("file."));
      return;
    }
    if (cmd_data.list.count() > 0) {
      wcf = 0;
    } else {
      wcf = cmd_data.watch_config_file.count();
    }
    x$ = info = {};
    x$.cmdname = args[0];
    x$.cmdargs = R.drop(1, args);
    x$.vars = vars;
    x$.configfile = config_file_name;
    x$.timedata = [0, 0, 0];
    x$.cmdline = R.drop(2, process.argv);
    y$ = x$.options = {};
    y$.verbose = cmd_data.verbose.count();
    y$.dryRun = cmd_data.dryRun.count();
    y$.watch_config_file = wcf;
    y$.list = cmd_data.list.count();
    y$.auto_make_directory = cmd_data.auto_make_directory.count();
    y$.no_watch = cmd_data.no_watch.count();
    y$.silent = silent;
    y$.edit = edit;
    y$.project = project_name;
    y$.ssh = CONF.ssh;
    y$.rsync = CONF.rsync;
    if (check_conf_file(CONF, info)) {
      return;
    }
    return most.generate(get_all, info).drain();
  };
};
most.generate(init).tap(main(cmd_data)).recoverWith(function(E){
  l(E.toString());
  return most.empty();
}).drain();
function deepEq$(x, y, type){
  var toString = {}.toString, hasOwnProperty = {}.hasOwnProperty,
      has = function (obj, key) { return hasOwnProperty.call(obj, key); };
  var first = true;
  return eq(x, y, []);
  function eq(a, b, stack) {
    var className, length, size, result, alength, blength, r, key, ref, sizeB;
    if (a == null || b == null) { return a === b; }
    if (a.__placeholder__ || b.__placeholder__) { return true; }
    if (a === b) { return a !== 0 || 1 / a == 1 / b; }
    className = toString.call(a);
    if (toString.call(b) != className) { return false; }
    switch (className) {
      case '[object String]': return a == String(b);
      case '[object Number]':
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        return +a == +b;
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') { return false; }
    length = stack.length;
    while (length--) { if (stack[length] == a) { return true; } }
    stack.push(a);
    size = 0;
    result = true;
    if (className == '[object Array]') {
      alength = a.length;
      blength = b.length;
      if (first) {
        switch (type) {
        case '===': result = alength === blength; break;
        case '<==': result = alength <= blength; break;
        case '<<=': result = alength < blength; break;
        }
        size = alength;
        first = false;
      } else {
        result = alength === blength;
        size = alength;
      }
      if (result) {
        while (size--) {
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))){ break; }
        }
      }
    } else {
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) {
        return false;
      }
      for (key in a) {
        if (has(a, key)) {
          size++;
          if (!(result = has(b, key) && eq(a[key], b[key], stack))) { break; }
        }
      }
      if (result) {
        sizeB = 0;
        for (key in b) {
          if (has(b, key)) { ++sizeB; }
        }
        if (first) {
          if (type === '<<=') {
            result = size < sizeB;
          } else if (type === '<==') {
            result = size <= sizeB
          } else {
            result = size === sizeB;
          }
        } else {
          first = false;
          result = size === sizeB;
        }
      }
    }
    stack.pop();
    return result;
  }
}