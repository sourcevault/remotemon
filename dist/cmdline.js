#!/usr/bin/env node

var ref$, data, com, print, global_data, readJson, most, j, exec, chokidar, most_create, updateNotifier, fs, metadata, optionParser, tampax, readline, dotpat, spawn, l, z, zj, R, lit, c, wait, noop, be, parser, rest, E, pkg, notifier, str, isvar, vars, args, search_for_default_config_file, get_all_yaml_files, findfile, user_config_file, all_files, wcf, x$, info, y$, vre, yaml_tokenize, isref, modify_yaml, nPromise, rmdef, only_str, exec_list_option, tampax_parse, V, mergeArray, defargs_main, unu, is_false, is_true, rsync_arr2obj, organize_rsync, zero, check_if_empty, create_logger, update, init_continuation, arrToStr, create_rsync_cmd, execFinale, exec_rsync, bko, check_if_remote_needed, check_if_remotehost_present, check_if_remotedir_present, remote_main_proc, onchange, diff, ms_empty, handle_inf, resolve_signal, print_final_message, ms_create_watch, restart, get_all, slice$ = [].slice, arrayFrom$ = Array.from || function(x){return slice$.call(x);};
ref$ = require("./data"), data = ref$.data, com = ref$.com, print = ref$.print;
global_data = data;
readJson = com.readJson, most = com.most, j = com.j, exec = com.exec, chokidar = com.chokidar, most_create = com.most_create, updateNotifier = com.updateNotifier, fs = com.fs, metadata = com.metadata, optionParser = com.optionParser, tampax = com.tampax, readline = com.readline;
dotpat = com.dotpat, spawn = com.spawn;
ref$ = com.hoplon.utils, l = ref$.l, z = ref$.z, zj = ref$.zj, j = ref$.j, R = ref$.R, lit = ref$.lit, c = ref$.c, wait = ref$.wait, noop = ref$.noop;
be = com.hoplon.types;
parser = new optionParser();
parser.addOption('h', 'help', null, 'help');
parser.addOption('v', 'verbose', null, 'verbose');
parser.addOption('V', 'version', null, 'version');
parser.addOption('d', 'dry-run', null, 'dryRun');
parser.addOption('w', 'watch-config-file', null, 'watch_config_file');
parser.addOption('c', 'config', null, 'config').argument('FILE');
parser.addOption('l', 'list', null, 'list');
parser.addOption('m', 'auto-make-directory', null, 'auto_make_directory');
parser.addOption('n', 'no-watch', null, 'no_watch');
if (!metadata.name) {
  return false;
}
try {
  rest = parser.parse();
} catch (e$) {
  E = e$;
  l(E.toString());
  return;
}
try {
  pkg = require("../package.json");
  notifier = updateNotifier({
    pkg: pkg
  });
  notifier.notify();
} catch (e$) {}
if (parser.help.count() > 0) {
  str = "remotemon version " + metadata.version + "\n\noptions:\n\n  -v --verbose               more detail\n\n  -vv                        much more detail\n\n  -h --help                  display help message\n\n  -V --version               displays version number\n\n  -d --dry-run               perform a trial run without making any changes\n\n  -w --watch-config-file     restart on config file change\n\n  -c --config                path to YAML configuration file\n\n  -l --list                  list all user commands\n\n  -m --auto-make-directory   make remote directory if it doesn't exist\n\n  -n --no-watch              force disable any and all watches\n\n  ---- shorthands ----\n\n  CF <-- for configuration file\n\nBy default remotemon will look for .remotemon.yaml in current directory and one level up (only).\n\nusing --config <filename>.yaml option will direct remotemon to use <filename>.yaml as config file :\n\n> remotemon --config custom.yaml\n> remotemon --config custom.yaml -v\n\nvalues for internal variables (using .global object) can be changed using '=' (similar to makefiles) :\n\n> remotemon --config custom.yaml --verbose file=dist/main.js\n\n[ documentation ] @ [ https://github.com/sourcevault/remotemon#readme.md ]\n";
  l(str);
  return;
}
print.showHeader();
if (parser.version.count() > 0) {
  return;
}
isvar = R.test(/^\w+=/);
vars = R.map(R.split('='))(
R.filter(isvar)(
rest));
args = R.reject(isvar, rest);
search_for_default_config_file = function(dirname){
  var out;
  out = " ls -lAh " + dirname + " | grep -v '^d' | awk 'NR>1 {print $NF}'";
  return R.map(function(x){
    return dirname + "/" + x;
  })(
  R.filter(function(str){
    return str === "." + metadata.name + ".yaml";
  })(
  R.split("\n")(
  exec(
  out))));
};
get_all_yaml_files = function(custom){
  var fin, upperPath;
  fin = [];
  if (fs.existsSync(custom)) {
    fin.push(custom);
  }
  fin.push.apply(fin, search_for_default_config_file(process.cwd()));
  upperPath = R.init(process.cwd().split("/")).join("/");
  fin.push.apply(fin, search_for_default_config_file(upperPath));
  return fin;
};
findfile = function(filename){
  var allfiles, filenames, I;
  allfiles = get_all_yaml_files(filename);
  if (allfiles.length === 0) {
    l(lit(["[" + metadata.name + "]", " • Error •", " cannot find ANY configuration file."], [c.er3, c.er1, c.warn]));
    return false;
  }
  filenames = (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = allfiles).length; i$ < len$; ++i$) {
      I = ref$[i$];
      results$.push(c.er1(I));
    }
    return results$;
  }()).join(c.warn(" > "));
  l(lit(["[" + metadata.name + "]", " using ", filenames], [c.er1, c.er1, c.er1]));
  return allfiles;
};
user_config_file = parser.config.value();
all_files = findfile(user_config_file);
if (!all_files) {
  return;
}
if (parser.list.count() > 0) {
  wcf = 0;
} else {
  wcf = parser.watch_config_file.count();
}
x$ = info = {};
x$.cmdname = args[0];
x$.cmdargs = R.drop(1, args);
x$.vars = vars;
x$.all_files = all_files;
x$.cmd_filename = null;
x$.timedata = [0, 0, 0];
x$.cmdline = R.drop(2, process.argv);
y$ = x$.options = {};
y$.verbose = parser.verbose.count();
y$.dryRun = parser.dryRun.count();
y$.watch_config_file = wcf;
y$.list = parser.list.count();
y$.auto_make_directory = parser.auto_make_directory.count();
y$.no_watch = parser.no_watch.count();
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
  var index, all, i$, len$, ref$, name, txt, j$, to$, I, current, firstline, isr, old_txt;
  index = arg$[0], all = arg$[1];
  for (i$ = 0, len$ = vars.length; i$ < len$; ++i$) {
    ref$ = vars[i$], name = ref$[0], txt = ref$[1];
    for (j$ = 1, to$ = all.length; j$ < to$; ++j$) {
      I = j$;
      current = all[I];
      if (current[0].name === name) {
        firstline = current[0];
        isr = isref.exec(firstline.txt);
        old_txt = current[0].txt;
        current[0].txt = isr[0] + txt;
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
modify_yaml = function(filename, cmdargs){
  var data, tokens, torna, yaml_text;
  data = R.toString(
  fs.readFileSync(
  filename));
  tokens = yaml_tokenize(data);
  torna = vars.get(tokens);
  torna = vars.edit(torna, cmdargs, tokens);
  torna = R.flatten(torna);
  yaml_text = vars.stringify(torna);
  return yaml_text;
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
exec_list_option = function(alldata){
  var i$, ref$, len$, ref1$, filename, data, lresult$, keys, user_ones, j$, to$, I, name, des, results$ = [];
  for (i$ = 0, len$ = (ref$ = R.reverse(alldata)).length; i$ < len$; ++i$) {
    ref1$ = ref$[i$], filename = ref1$[0], data = ref1$[1];
    lresult$ = [];
    l(lit(['> FILE ', filename], [c.warn, c.pink]));
    keys = Object.keys(data);
    user_ones = rmdef(keys);
    if (user_ones.length === 0) {
      l(lit(["  --- ", "< EMPTY >", " ---"], [c.pink, c.warn, c.pink]));
    }
    for (j$ = 0, to$ = user_ones.length; j$ < to$; ++j$) {
      I = j$;
      name = user_ones[I];
      des = only_str(data[name].description);
      lresult$.push(l(lit([" • ", name, des], [c.warn, c.ok, null])));
    }
    results$.push(lresult$);
  }
  return results$;
};
tampax_parse = function(yaml_text, cmdargs, filename){
  return nPromise(function(resolve, reject){
    return tampax.yamlParseString(yaml_text, arrayFrom$(cmdargs), function(err, rawjson){
      if (err) {
        print.failed_in_tampax_parsing(filename, err);
        resolve('error.validator.tampaxparsing');
        return;
      }
      return resolve([filename, rawjson]);
    });
  });
};
V = {};
V.check_config_file = be.known.obj.on('cmd', be.str.and(function(cmd){
  return !global_data.selected_keys.set.has(cmd);
}).or(be.undef)).err(function(msg, path, state){
  return [':in_selected_key', [state.cmd, state.cmdline]];
}).and(function(raw){
  if (raw.cmd !== undefined && raw.origin[raw.cmd] === undefined) {
    return [false, [':usercmd_not_defined', raw.cmd]];
  }
  return true;
});
mergeArray = function(deflength, def, arr){
  var fin, i$, I;
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
defargs_main = be.undefnull.cont(function(){
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
})).alt(be.int.pos.cont(function(num){
  var state, len;
  state = arguments[arguments.length - 1];
  len = R.max(num, state.cmdargs.length);
  return ['req', len, []];
})).err([':defargs.type', 'is not of type array / str / int.pos']);
V.defargs = defargs_main.cont(function(data){
  var state, __, len, list;
  state = arguments[arguments.length - 1];
  __ = data[0], len = data[1], list = data[2];
  data[2] = mergeArray(len, data[2], state.cmdargs);
  return data;
}).and(function(impdefargs){
  var info, type, len, list;
  info = arguments[arguments.length - 1];
  type = impdefargs[0], len = impdefargs[1], list = impdefargs[2];
  if (type === 'req' && len > list.length) {
    return [false, [':defargs.req', len]];
  }
  return true;
}).err(function(E){
  var info, path, type, msg, F;
  info = arguments[arguments.length - 1];
  path = ['defargs'];
  if (info.cmdname) {
    path.unshift(info.cmdname);
  }
  type = E[0], msg = E[1];
  F = (function(){
    switch (type) {
    case ':defargs.req':
      return print.defargs_req;
    case ':defargs.type':
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
V.maybe = {};
V.maybe.bool = be.bool.or(unu);
V.maybe.num = be.num.or(unu);
V.maybe.str = be.str.or(unu);
V.maybe.obj = be.obj.or(unu);
V.maybe.arr = be.arr.or(unu);
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
organize_rsync = function(data, cmdname){
  var rsync, remotefold, fin, i$, to$, I, st;
  rsync = data.rsync, remotefold = data.remotefold;
  if (rsync === false) {
    return data;
  }
  if (rsync === true) {
    rsync = [global_data.def.rsync.concat({
      des: remotefold
    })];
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
  return data;
};
V.rsync.init = be.bool.or(be.undefnull.cont(false)).or(be.arr.map(be.arr).err(function(msg, key){
  switch (key) {
  case undefined:
    return [':def', 'not array'];
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
    'exec-locale': list
  };
})).on('initialize', V.maybe.bool).on('watch', V.watch.user).on('verbose', be.num.or(unu)).on('ignore', V.ignore.user).on('ssh', be.str.or(unu)).on(['exec-remote', 'exec-locale', 'exec-finale'], V.execlist).on('rsync', V.rsync.init).on(['remotehost', 'remotefold'], be.str.or(unu.cont(function(v, key){
  var origin;
  origin = arguments[arguments.length - 1];
  return origin[key];
}))).cont(organize_rsync).and(V.rsync.throw_if_error);
V.def = be.obj.on(['remotehost', 'remotefold'], be.str.or(unu)).on('verbose', be.num.or(unu.cont(false))).on('initialize', be.bool.or(be.undefnull.cont(true))).on('watch', V.watch.def).on('ignore', V.ignore.def).on('ssh', be.str.or(be.undefnull.cont(global_data.def.ssh))).on(['exec-locale', 'exec-finale', 'exec-remote'], V.execlist).on('rsync', V.rsync.init).cont(organize_rsync).and(V.rsync.throw_if_error).map(function(value, key){
  var ref$, def, user, origin, put;
  ref$ = arguments[arguments.length - 1], def = ref$.def, user = ref$.user, origin = ref$.origin;
  switch (global_data.selected_keys.set.has(key)) {
  case true:
    def[key] = value;
    break;
  case false:
    put = V.user.auth(value, key, origin);
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
    for (i$ = 0, len$ = (ref$ = data.selected_keys.undef).length; i$ < len$; ++i$) {
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
check_if_empty = be.known.obj.on('exec-locale', zero).on('exec-finale', zero).on('exec-remote', zero).on('rsync', be.arr.and(zero).or(V.isFalse)).cont(true).fix(false).wrap();
create_logger = function(info, gconfig){
  var cmdname, lconfig, buildname, verbose, log;
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
  log = print.create_logger(buildname, verbose);
  return [lconfig, log, buildname];
};
update = function*(lconfig, yaml_text, info){
  var defargs, ref$, args, __, origin, vout, gconfig, log, buildname;
  defargs = V.defargs.auth(lconfig.defargs, info);
  if (defargs.error) {
    return 'error';
  }
  ref$ = defargs.value, args = ref$[ref$.length - 1];
  ref$ = (yield tampax_parse(yaml_text, args, info.cmd_filename)), __ = ref$[0], origin = ref$[1];
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
    lconfig.watch.unshift(info.cmd_filename);
  }
  return [lconfig, log, buildname];
};
init_continuation = function(dryRun){
  return function*(cmd, type){
    var status;
    type == null && (type = 'async');
    if (dryRun) {
      status = 0;
    } else {
      status = spawn(cmd).status;
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
  postscript = lconfig['exec-finale'];
  log.normal(postscript.length, 'ok', " exec-finale", c.warn("(" + postscript.length + ") "));
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
  disp = each.src.join(" ") + " ->" + " " + remotehost + ":" + each.des;
  log.normal('ok', lit([" rsync", " start"], [0, c.warn]), c.grey(disp));
  log.verbose("....", cmd);
  status = (yield* cont(cmd, 'sync'));
  if (status !== 'ok') {
    log.normal('err_light', lit([" rsync", " break"], [c.pink, c.er2]), "");
    return (yield nPromise(function(resolve, reject){
      return reject(status);
    }));
  } else {
    return log.normal('ok', lit([" rsync ", "✔️ ok"], [0, c.ok]), "");
  }
};
bko = be.known.obj;
check_if_remote_needed = bko.on('remotehost', be.undef).or(bko.on('remotefold', be.undef)).and(bko.on('exec-remote', be.not(zero)).or(bko.on('rsync', be.not(V.isFalse)))).cont(true).fix(false).wrap();
check_if_remotehost_present = function*(data){
  var lconfig, log, tryToSSH, E;
  lconfig = data.lconfig, log = data.log;
  tryToSSH = "ssh " + lconfig.ssh + " " + lconfig.remotehost + " 'ls'";
  try {
    return exec(tryToSSH);
  } catch (e$) {
    E = e$;
    log.normal('err', "", lit(["unable to ssh to remote address ", lconfig.remotehost, "."], [c.er1, c.er2, c.er1]));
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
    return exec(checkDir);
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
            log.normal('err', " exec-remote", lit(["cannot continue exec-remote without remotefolder ", lconfig.remotefold, "."], [c.er1, c.warn, c.er1, c.er1]));
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
      return log.normal('ok', " exec-remote", lit([' ✔️ ok •', " " + lconfig.remotehost + ":" + lconfig.remotefold + " ", "created with ", msg + "", " permissions."], [c.ok, c.warn, c.grey, c.ok, c.grey]));
    }
  }
};
remote_main_proc = function*(data, remotetask){
  var lconfig, log, cont, remotehost, remotefold, disp, i$, len$, I, cmd, results$ = [];
  lconfig = data.lconfig, log = data.log, cont = data.cont;
  remotehost = lconfig.remotehost, remotefold = lconfig.remotefold;
  disp = lit(["(" + remotetask.length + ") ", remotehost + ":" + remotefold], [c.warn, c.grey]);
  log.normal(remotetask.length, 'ok', " exec-remote", disp);
  for (i$ = 0, len$ = remotetask.length; i$ < len$; ++i$) {
    I = remotetask[i$];
    cmd = ("ssh " + lconfig.ssh + " ") + remotehost + " '" + ("cd " + remotefold + ";") + I + "'";
    log.verbose(I, cmd);
    results$.push((yield* cont(cmd)));
  }
  return results$;
};
onchange = function*(data){
  var info, lconfig, log, cont, remotehost, remotefold, locale, remotetask, i$, len$, cmd, ref$, each;
  info = data.info, lconfig = data.lconfig, log = data.log, cont = data.cont;
  if (check_if_remote_needed(lconfig)) {
    log.normal('err', " ⚡️ ⚡️ error", c.er2(".remotehost/.remotefold ( required for task ) not defined."));
    (yield 'error');
    return;
  }
  if (check_if_empty(lconfig)) {
    log.normal('err', " ⚡️ ⚡️ error", c.er1("empty execution, no user command to execute."));
    (yield 'error');
    return;
  }
  remotehost = lconfig.remotehost, remotefold = lconfig.remotefold;
  locale = lconfig['exec-locale'];
  remotetask = lconfig['exec-remote'];
  log.normal(locale.length, 'ok', " exec-locale", c.warn("(" + locale.length + ")"));
  for (i$ = 0, len$ = locale.length; i$ < len$; ++i$) {
    cmd = locale[i$];
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
  if (remotetask.length && !info.options.dryRun) {
    (yield* check_if_remotedir_present(data));
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
      log.normal('err', " ⚡️ ⚡️ error", c.er1("infinite loop detected ") + c.warn(ob.value) + c.er1(" is offending file, ignoring event."));
      if (lconfig.watch.length > 0) {
        log.normal('ok', " returing to watch ");
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
})).cont(function(arg$, log){
  var cmdtxt;
  cmdtxt = arg$[0];
  log.normal('err_light', " ⚡️ ⚡️ error", cmdtxt);
  return 'error';
}).alt(be.str).wrap();
print_final_message = function(log, lconfig, info){
  return function(signal){
    var msg;
    signal = resolve_signal(signal, log);
    if (lconfig.watch.length === 0 || info.options.no_watch > 0) {
      lconfig.rl.close();
      return;
    }
    if (info.options.watch_config_file) {
      msg = c.pink("*CF") + c.er2(" returning to watch");
    } else {
      msg = "returning to watch";
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
ms_create_watch = function(lconfig, info, log){
  var should_I_watch, disp, I, ms_file_watch, cont, ms;
  should_I_watch = lconfig.watch.length > 0 && info.options.no_watch === 0;
  if (should_I_watch) {
    disp = lconfig.watch;
    if (info.options.watch_config_file && disp.length > 0) {
      disp = R.drop(1, disp);
      disp.unshift(c.pink("CF"));
    }
    log.normal(should_I_watch, 'err_light', "    watching", (function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = disp).length; i$ < len$; ++i$) {
        I = ref$[i$];
        results$.push(c.warn(I));
      }
      return results$;
    }()).join(" "));
    log.normal(should_I_watch && lconfig.ignore.length, 'err_light', "     ignored", (function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = lconfig.ignore).length; i$ < len$; ++i$) {
        I = ref$[i$];
        results$.push(c.warn(I));
      }
      return results$;
    }()).join(" "));
  }
  ms_file_watch = most_create(function(add, end, error){
    var rl, watcher;
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
    if (should_I_watch) {
      watcher = chokidar.watch(lconfig.watch, {
        awaitWriteFinish: true,
        ignored: lconfig.ignore,
        ignorePermissionErrors: true
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
  cont = init_continuation(info.options.dryRun);
  ms = ms_file_watch.timestamp().loop(handle_inf(log, lconfig), info.timedata).switchLatest().takeWhile(function(filename){
    if (filename === info.cmd_filename) {
      return false;
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
  var msg, filename, yaml_text, E, fup, gconfig, lconfig, defargs, vari;
  msg = lit([info.cmd_filename + "", " changed, restarting watch"], [c.warn, c.er1]);
  log.normal('err', msg);
  filename = info.cmd_filename;
  try {
    yaml_text = modify_yaml(filename, info.vars);
  } catch (e$) {
    E = e$;
    print.failed_in_custom_parser(filename, E);
    return;
  }
  fup = (yield tampax_parse(yaml_text, info.cmdargs, filename));
  if (fup === 'error.validator.tampaxparsing') {
    return;
  }
  filename = fup[0], gconfig = fup[1];
  if (info.cmdname) {
    lconfig = gconfig[info.cmdname];
    defargs = lconfig.defargs;
  } else {
    lconfig = gconfig;
    defargs = gconfig.defargs;
  }
  vari = (yield* update(lconfig, yaml_text, info));
  if (vari === 'error') {
    return;
  }
  lconfig = vari[0], log = vari[1];
  return ms_create_watch(lconfig, info, log);
};
get_all = function*(info){
  var raw, i$, ref$, len$, filename, yaml_text, E, fup, found, ref1$, gconfig, lconfig, vari, log;
  raw = {};
  raw.unparsed = {};
  raw.parsed = [];
  for (i$ = 0, len$ = (ref$ = info.all_files).length; i$ < len$; ++i$) {
    filename = ref$[i$];
    try {
      yaml_text = modify_yaml(filename, info.vars);
      raw.unparsed[filename] = yaml_text;
    } catch (e$) {
      E = e$;
      print.failed_in_custom_parser(filename, E);
      return;
    }
    fup = (yield tampax_parse(yaml_text, info.cmdargs, filename));
    if (fup === 'error.validator.tampaxparsing') {
      return;
    }
    raw.parsed.push(fup);
  }
  if (info.options.list) {
    exec_list_option(raw.parsed);
    return;
  }
  if (info.cmdname) {
    if (global_data.selected_keys.set.has(info.cmdname)) {
      print.in_selected_key(info.cmdname, info.cmdline);
      return;
    }
    found = false;
    for (i$ = 0, len$ = (ref$ = raw.parsed).length; i$ < len$; ++i$) {
      ref1$ = ref$[i$], filename = ref1$[0], gconfig = ref1$[1];
      if (gconfig[info.cmdname]) {
        found = true;
        info.cmd_filename = filename;
        break;
      }
    }
    if (!found) {
      print.could_not_find_custom_cmd(info.cmdname);
      return;
    }
    lconfig = gconfig[info.cmdname];
  } else {
    ref$ = raw.parsed[0], filename = ref$[0], gconfig = ref$[1];
    lconfig = gconfig;
    info.cmd_filename = filename;
  }
  vari = (yield* update(lconfig, raw.unparsed[info.cmd_filename], info));
  if (vari === 'error') {
    return;
  }
  lconfig = vari[0], log = vari[1];
  return ms_create_watch(lconfig, info, log);
};
most.generate(get_all, info).drain();