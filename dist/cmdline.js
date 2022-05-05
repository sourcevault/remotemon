#!/usr/bin/env node

var ref$, global_data, com, print, readJson, most, j, exec, chokidar, most_create, fs, metadata, optionParser, tampax, readline, dotpat, spawn, yaml, compare_version, boxen, emphasize, child_process, l, z, zj, R, lit, c, wait, noop, be, cp, homedir, CONFIG_FILE_NAME, cmd_data, question_init, init, rest, str, silent, edit, concatenate, isvar, check_if_number, vars, args, V, defarg_main, san_inpwd, san_var, rm_empty_lines, san_user_script, run_script, x$, gs_path, pathset, make_script_blank, update_doc, show, modyaml, nPromise, rmdef, only_str, SERR, OK, tampax_parse, mergeArray, unu, is_false, is_true, rsync_arr2obj, ifrsh, organize_rsync, dangling_colon, handle_ssh, disp, zero, check_if_empty, create_logger, update, init_continuation, arrToStr, create_rsync_cmd, execFinale, exec_rsync, bko, check_if_remote_needed, check_if_remotehost_present, check_if_remotedir_present, remote_main_proc, onchange, diff, ms_empty, handle_inf, resolve_signal, print_final_message, ms_create_watch, restart, check_conf_file, get_all, main, slice$ = [].slice, arrayFrom$ = Array.from || function(x){return slice$.call(x);};
ref$ = require("./data"), global_data = ref$.global_data, com = ref$.com, print = ref$.print;
readJson = com.readJson, most = com.most, j = com.j, exec = com.exec, chokidar = com.chokidar, most_create = com.most_create, fs = com.fs, metadata = com.metadata, optionParser = com.optionParser, tampax = com.tampax, readline = com.readline;
dotpat = com.dotpat, spawn = com.spawn, yaml = com.yaml, compare_version = com.compare_version, boxen = com.boxen, emphasize = com.emphasize, child_process = com.child_process;
ref$ = com.hoplon.utils, l = ref$.l, z = ref$.z, zj = ref$.zj, j = ref$.j, R = ref$.R, lit = ref$.lit, c = ref$.c, wait = ref$.wait, noop = ref$.noop;
be = com.hoplon.types;
cp = child_process;
homedir = require('os').homedir();
CONFIG_FILE_NAME = ".remotemon.yaml";
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
cmd_data.addOption('c', 'cat', null, 'cat');
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
        msg = "update available " + c.er2(vn) + c.ok((" ➝ " + metadata.version) + "\n\n" + c.grey("> npm i -g remotemon \n" + c.grey("> yarn global add remotemon \n" + c.grey("> pnpm add -g remotemon"))));
        return boxen.then(function(mo){
          var boite;
          boite = mo['default'];
          return console.log(boite(msg, {
            padding: 1,
            borderColor: "green",
            textAlignment: "left"
          }));
        });
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
  str = "" + metadata.name + " version " + metadata.version + "\n\noptions:\n\n  -v --verbose               more detail\n\n  -vv                        much more detail\n\n  -h --help                  display help message\n\n  -V --version               displays version number\n\n  -d --dry-run               perform a trial run without making any changes\n\n  -w --watch-config-file     restart on config file change\n\n  -c --cat                   dump the output of the current " + CONFIG_FILE_NAME + " being used\n\n  -cc                        same as -c but with comments\n\n  -ccc                       show raw json for final process state\n\n  -l --list                  list all user commands\n\n  -m --auto-make-directory   make remote directory if it doesn't exist ( with user permission )\n\n     -mm                     ( with root permission )\n\n  -n --no-watch              force disable any and all watches\n\n  -s --silent                do not show " + metadata.name + " messages\n\n  -e --edit                  make permanent edits to " + CONFIG_FILE_NAME + " values\n\n  -p --project               folder name to look for " + CONFIG_FILE_NAME + "\n\n  ---- shorthands ----\n\n  CF <-- for configuration file\n\nvalues for internal variables (using .global object) can be changed using '=' (similar to makefiles) :\n\n> " + metadata.name + " --verbose file=dist/main.js\n\n[ documentation ] @ [ " + metadata.homepage + " ]\n";
  l(str);
  return;
}
silent = cmd_data.silent.count();
edit = cmd_data.edit.count();
concatenate = cmd_data.cat.count();
if (cmd_data.version.count() > 0) {
  l(c.er1("[" + metadata.name + "] version " + metadata.version));
  return;
}
isvar = R.test(/^[\.\w\/]+=/);
check_if_number = function(str_data){
  var isnum;
  isnum = Number(str_data);
  if (!deepEq$(isnum, NaN, '===')) {
    return isnum;
  }
  return str_data;
};
vars = R.map(R.pipe(R.split('='), R.over(R.lensIndex(0), R.split("/")), R.over(R.lensIndex(1), check_if_number)))(
R.filter(isvar)(
rest));
args = R.reject(isvar, rest);
V = {};
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
san_inpwd = function(l, g){
  switch (R.type(l)) {
  case 'Boolean':
    return l;
  default:
    switch (R.type(g)) {
    case 'Boolean':
      return g;
    default:
      return false;
    }
  }
};
san_var = be.obj.fix(function(){
  return {};
}).wrap();
rm_empty_lines = R.pipe(R.filter(function(str){
  if (str.length === 0) {
    return false;
  } else {
    return true;
  }
}));
san_user_script = function(lin){
  var todisp, toexit;
  lin = rm_empty_lines(lin);
  todisp = R.join('\n')(R.init(lin));
  toexit = R.last(lin);
  return [todisp, toexit];
};
run_script = function(str, inpwd, project, path){
  var lines, sp, interpreter, script, cmd, cwd, stdin, sortir, err_msg, user_lines, ref$, to_disp, to_exit;
  lines = str.split('\n');
  sp = lines[0].split(" ");
  interpreter = sp[sp.length - 1];
  lines.unshift();
  script = lines.join("\n");
  cmd = script.replace(/"/g, '\\"');
  cwd = inpwd ? undefined : project;
  stdin = interpreter + " <<<\"" + cmd + "\"";
  sortir = cp.spawnSync(stdin, [], {
    shell: 'bash',
    windowsVerbatimArguments: true,
    cwd: cwd
  });
  err_msg = sortir.stderr.toString();
  if (err_msg.length > 0) {
    print.error_in_user_script(err_msg, path);
  }
  user_lines = sortir.stdout.toString().split("\n");
  ref$ = san_user_script(user_lines), to_disp = ref$[0], to_exit = ref$[1];
  process.stdout.write(to_disp);
  return to_exit;
};
x$ = gs_path = {};
x$.loop = null;
x$.main = null;
gs_path.loop = be.obj.alt(be.arr).forEach(function(){
  var ref$;
  return (ref$ = gs_path.loop).auth.apply(ref$, arguments)['continue'];
}).or(be.str.and(function(str){
  var lines, shebang;
  lines = str.split('\n');
  shebang = lines[0].match(/!#|#!/);
  if (lines.length > 1 && shebang) {
    return true;
  }
  return false;
}).tap(function(str){
  var hist, path, i$, to$, I;
  hist = arguments[arguments.length - 1];
  path = [];
  for (i$ = 1, to$ = arguments.length - 1; i$ < to$; ++i$) {
    I = i$;
    path.unshift(arguments[I]);
  }
  return hist.push(path);
}));
pathset = function(path, obj, str){
  var ou, i$, to$, I;
  ou = obj;
  for (i$ = 0, to$ = path.length - 1; i$ < to$; ++i$) {
    I = i$;
    ou = ou[path[I]];
  }
  ou[path[path.length - 1]] = str;
  return obj;
};
make_script_blank = function(obj, mpath){
  var i$, len$, path;
  for (i$ = 0, len$ = mpath.length; i$ < len$; ++i$) {
    path = mpath[i$];
    pathset(path, obj, '<remotemon:script.loop.error>');
  }
};
gs_path.main = function(obj, path){
  var hist, sortir, i$, len$, I;
  path == null && (path = []);
  hist = [];
  gs_path.loop.auth(obj, hist);
  sortir = [];
  for (i$ = 0, len$ = hist.length; i$ < len$; ++i$) {
    I = hist[i$];
    sortir.push(arrayFrom$(path).concat(arrayFrom$(I)));
  }
  return sortir;
};
update_doc = function(info, doc){
  var cmdname, path, i$, ref$, len$, ref1$, key, value, nominal_path, init, p, v_path, d_path, json, all_path, alive, dead, for_tampax, index, second, third;
  cmdname = info.cmdname;
  path = [];
  if (cmdname === undefined) {
    for (i$ = 0, len$ = (ref$ = info.vars).length; i$ < len$; ++i$) {
      ref1$ = ref$[i$], key = ref1$[0], value = ref1$[1];
      if (key[0] === 'var') {
        key.unshift();
      }
      doc.setIn(['var'].concat(arrayFrom$(key)), value);
    }
    nominal_path = [];
  } else {
    for (i$ = 0, len$ = (ref$ = info.vars).length; i$ < len$; ++i$) {
      ref1$ = ref$[i$], key = ref1$[0], value = ref1$[1];
      if (key[0] === 'var') {
        init = [];
      } else {
        init = [cmdname, 'var'];
      }
      p = arrayFrom$(init).concat(arrayFrom$(key));
      doc.setIn(p, value);
    }
    nominal_path = [cmdname];
  }
  v_path = arrayFrom$(nominal_path).concat(['var']);
  d_path = arrayFrom$(nominal_path).concat(['defarg']);
  json = doc.toJS();
  all_path = gs_path.main(json);
  alive = [];
  dead = [];
  for_tampax = [];
  if (cmdname === undefined) {
    for (i$ = 0, len$ = all_path.length; i$ < len$; ++i$) {
      index = i$;
      path = all_path[i$];
      init = path[0], second = path[1], third = path[2];
      for_tampax.push(path);
      if (init === 'var' || init === 'defarg') {
        alive.push(path);
        for_tampax.push(R.tail(path));
      } else {
        dead.push(path);
      }
    }
  } else {
    for (i$ = 0, len$ = all_path.length; i$ < len$; ++i$) {
      index = i$;
      path = all_path[i$];
      init = path[0], second = path[1], third = path[2];
      for_tampax.push(path);
      if (init === cmdname && (second === 'var' || second === 'defarg')) {
        alive.push(path);
        for_tampax.push(R.splitAt(2, path)[1]);
      } else {
        dead.push(path);
      }
    }
  }
  path = {
    for_tampax: for_tampax,
    allpath: all_path,
    n: nominal_path,
    alive: alive,
    dead: dead,
    v: v_path,
    d: d_path
  };
  return [path, json];
};
show = function(ob){
  console.log(ob);
  return ob;
};
modyaml = function*(info){
  var configfile, data, doc, ref$, path, json, defargdoc, defarg, arr, l_vars, merged, project, inpwd, i$, len$, each, result, yaml_text, E, vars, n_merged, gjson, ljson, sortir;
  configfile = info.configfile;
  data = R.toString(
  fs.readFileSync(
  configfile));
  doc = yaml.parseDocument(data);
  ref$ = update_doc(info, doc), path = ref$[0], json = ref$[1];
  defargdoc = R.path(path.d, json);
  defarg = V.defarg.auth(defargdoc, info);
  if (defarg.error) {
    return SERR;
  }
  arr = defarg.value[2];
  l_vars = san_var(R.path(path.v, json));
  merged = R.mergeDeepLeft(R.mergeDeepLeft(arr, l_vars), R.clone(json));
  make_script_blank(merged, path.for_tampax);
  project = info.options.project;
  inpwd = san_inpwd(R.path(arrayFrom$(path.n).concat(['inpwd']), json), json.inpwd);
  for (i$ = 0, len$ = (ref$ = path.alive).length; i$ < len$; ++i$) {
    each = ref$[i$];
    result = run_script(tampax(R.path(each, json), merged), inpwd, project, each);
    doc.setIn(each, result);
    pathset(each, json, result);
  }
  for (i$ = 0, len$ = (ref$ = path.dead).length; i$ < len$; ++i$) {
    each = ref$[i$];
    doc.setIn(each, '');
  }
  try {
    yaml_text = String(doc);
  } catch (e$) {
    E = e$;
    return SERR;
  }
  defarg = R.tryCatch(JSON.parse, function(){
    return [];
  })(
  String(
  doc.getIn(
  path.d)));
  vars = R.tryCatch(JSON.parse, function(){
    return {};
  })(
  String(
  doc.getIn(
  path.v)));
  n_merged = R.mergeAll([defarg, vars]);
  gjson = (yield tampax_parse(yaml_text, n_merged, configfile));
  ljson = R.path(path.n, gjson);
  sortir = {
    yaml_text: yaml_text,
    gjson: gjson,
    ljson: ljson
  };
  return sortir;
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
function exec_cat_option(yaml_text, concat_count){
  var hash_first;
  hash_first = RegExp('^#');
  return emphasize.then(function(pod){
    var lines, interm, i$, len$, I, text;
    lines = yaml_text.split("\n");
    interm = [];
    switch (concat_count) {
    case 1:
      for (i$ = 0, len$ = lines.length; i$ < len$; ++i$) {
        I = lines[i$];
        if (!hash_first.exec(I) && I.length !== 0) {
          interm.push(I);
        }
      }
      break;
    case 2:
      interm = lines;
    }
    text = interm.join('\n');
    return pod.emphasize.highlightAuto(text).value;
  });
}
SERR = Symbol('error');
OK = Symbol('ok');
tampax_parse = function(yaml_text, cmdargs, filename){
  return nPromise(function(resolve, reject){
    return tampax.yamlParseString(yaml_text, cmdargs, function(err, rawjson){
      if (err) {
        err = err.split("\n")[0];
        print.failed_in_tampax_parsing(filename, err);
        resolve(SERR);
        return;
      }
      return resolve(rawjson);
    });
  });
};
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
  var sortir, i$, len$, str, nstr;
  sortir = [];
  for (i$ = 0, len$ = strlist.length; i$ < len$; ++i$) {
    str = strlist[i$];
    nstr = str.replace(/'/g, "'''");
    sortir.push(nstr);
  }
  return sortir;
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
        ssh = [['rsh', "ssh " + state.origin.ssh.option]];
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
dangling_colon = function(arr){
  var sortir, re, i$, len$, str;
  sortir = "";
  re = /;\s*/;
  for (i$ = 0, len$ = arr.length; i$ < len$; ++i$) {
    str = arr[i$];
    str = str.replace(re, ";");
    if (!(str[str.length - 1] === ";")) {
      str = str + ";";
    }
    sortir += str;
  }
  return sortir;
};
V.ssh = be.obj.on('option', be.str.or(unu)).on('startwith', be.arr.map(be.str).or(be.undefnull.cont(function(){
  return [];
}))).alt(be.str.cont(function(str){
  return {
    option: str,
    startwith: []
  };
})).alt(be.undefnull.cont(function(){
  return {
    option: void 8,
    startwith: []
  };
}));
V.def_ssh = V.ssh.cont(function(ob){
  var state, origin;
  state = arguments[arguments.length - 1];
  origin = state.origin;
  if (ob.startwith.length === 0) {
    ob.startwith.push("cd " + origin.remotefold);
  }
  if (ob.option === void 8) {
    ob.option = state.info.options.ssh;
  }
  ob.startwith = dangling_colon(ob.startwith);
  return ob;
});
V.user_ssh = V.ssh;
handle_ssh = function(user, def){
  if (user.ssh.startwith.length === 0) {
    user.ssh.startwith = def.ssh.startwith;
  }
  if (!user.ssh.option) {
    user.ssh.option = def.ssh.option;
  }
};
V.vars = be.obj.or(be.undefnull.cont(function(){
  return {};
})).cont(function(ob){
  var info;
  info = arguments[arguments.length - 1];
  return R.mergeDeepLeft(ob, info.origin['var']);
});
V.user = be.obj.err("custom user defined task, has to be object.").or(be.undefnull.cont(function(){
  return {};
})).and(be.restricted(global_data.selected_keys.arr)).err("key not recognized.").alt(V.strlist.empty.cont(function(list){
  return {
    'local': list
  };
})).on(['initialize', 'inpwd', 'silent'], be.bool.or(unu)).on('watch', V.watch.user).on('verbose', be.num.or(unu)).on('ignore', V.ignore.user).on(['pre', 'remote', 'local', 'final'], V.execlist).on('rsync', V.rsync.init).on(['remotehost', 'remotefold'], be.str.or(unu.cont(function(v, key){
  var origin;
  origin = arguments[arguments.length - 1].origin;
  return origin[key];
}))).cont(organize_rsync).and(V.rsync.throw_if_error).on('ssh', V.user_ssh).on('var', V.vars);
disp = function(num){
  return function(){
    return console.log(num);
  };
};
V.def = be.obj.on(['remotehost', 'remotefold'], be.str.or(unu)).on(['inpwd', 'silent'], be.bool.or(be.undefnull.cont(false))).on('verbose', be.num.or(be.undefnull.cont(0))).on('initialize', be.bool.or(be.undefnull.cont(true))).on('watch', V.watch.def).on('ignore', V.ignore.def).on(['pre', 'local', 'final', 'remote'], V.execlist).on('rsync', V.rsync.init).cont(organize_rsync).and(V.rsync.throw_if_error).on('ssh', V.def_ssh).map(function(value, key){
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
    handle_ssh(value, def);
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
}).err(function(message, path, val){
  var info, sortir, topmsg, loc, Error, F;
  info = arguments[arguments.length - 1].info;
  sortir = be.flatro(message);
  topmsg = sortir[0];
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
      Error = topmsg;
      return print.basicError;
    }
  }());
  F(Error, path, info.configfile);
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
update = function*(gjson, info){
  var vout, ref$, lconfig, log, buildname;
  vout = V.def.auth(gjson, {
    def: {},
    user: {},
    origin: gjson,
    info: info
  });
  if (vout.error) {
    return SERR;
  }
  gjson = vout.value;
  ref$ = create_logger(info, gjson), lconfig = ref$[0], log = ref$[1], buildname = ref$[2];
  if (info.options.concat === 3) {
    emphasize.then(function(pod){
      return l(pod.emphasize.highlightAuto(j(lconfig)).value);
    });
    return SERR;
  }
  if (info.options.watch_config_file) {
    lconfig.watch.unshift(info.configfile);
  }
  return [lconfig, log, buildname];
};
init_continuation = function(dryRun, dir, inpwd){
  return function*(cmd, type){
    var status, sortir;
    type == null && (type = 'async');
    if (dryRun) {
      status = 0;
    } else {
      sortir = spawn(cmd, dir, inpwd);
      status = sortir.status;
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
  tryToSSH = "ssh " + lconfig.ssh.option + " " + lconfig.remotehost + " 'ls'";
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
  checkDir = "ssh " + lconfig.ssh.option + " " + lconfig.remotehost + " 'ls " + lconfig.remotefold + " 2>&1'";
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
      mkdir = "ssh " + lconfig.ssh.option + " " + lconfig.remotehost + " '" + cmd + " " + lconfig.remotefold + "'";
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
    cmd = "ssh " + lconfig.ssh.option + " " + remotehost + " '" + lconfig.ssh.startwith + " " + I + "'";
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
      cwd = info.options.project;
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
    if (filename === info.configfile) {
      if (info.options.watch_config_file) {
        return false;
      }
    }
    return true;
  }).continueWith(function(filename){
    most.generate(restart, info, log).continueWith(function(SIG){
      if (SIG === OK) {
        return most.empty();
      }
      lconfig.initialize = false;
      wait(0, function(){
        var msg;
        msg = lit([info.configfile + "", " <--parse error"], [c.warn, c.er3]);
        log.normal('err', msg);
        msg = lit(["setting up watch using using old configuration file.."], [c.er1]);
        log.normal('err', msg);
        return most.generate(ms_create_watch, lconfig, info, log).drain();
      });
      return most.empty();
    }).drain();
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
    }).observe(print_final_message(log, lconfig, info));
  });
  return ms.drain();
};
restart = function*(info, log){
  var msg, ref, E, yaml_text, gjson, sortir, lconfig, aout;
  msg = lit([info.configfile + "", " changed, restarting watch.."], [c.warn, c.er1]);
  log.normal('err', msg);
  try {
    ref = (yield* modyaml(info));
  } catch (e$) {
    E = e$;
    return SERR;
  }
  if (ref === SERR) {
    return SERR;
  }
  yaml_text = ref.yaml_text, gjson = ref.gjson;
  sortir = (yield* update(gjson, info));
  if (in$(sortir, SERR)) {
    return SERR;
  }
  lconfig = sortir[0], log = sortir[1];
  aout = most.generate(ms_create_watch, lconfig, info, log).drain();
  return OK;
};
V.CONF = be.known.obj.on('rsync', V.rsync.init).on('ssh', V.ssh).cont(organize_rsync).and(V.rsync.throw_if_error).err(function(message, path){
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
  var D, x$, origin, sortir;
  D = {};
  D.rsync = conf.rsync;
  D.ssh = conf.ssh;
  D.remotefold = '';
  x$ = origin = {};
  x$.ssh = conf.ssh;
  sortir = V.CONF.auth(D, info.cmdname, {
    origin: origin,
    info: info
  });
  return sortir.error;
};
get_all = function*(info){
  var ref, yaml_text, gjson, concat, sortir, lconfig, log;
  ref = (yield* modyaml(info));
  if (ref === SERR) {
    return;
  }
  yaml_text = ref.yaml_text, gjson = ref.gjson;
  if (info.options.edit) {
    fs.writeFileSync(info.configfile, yaml_text);
    return;
  }
  if (info.options.list) {
    exec_list_option(gjson, info);
    return;
  }
  concat = info.options.concat;
  if (concat === 1 || concat === 2) {
    exec_cat_option(ref.yaml_text, concat);
    return;
  }
  sortir = (yield* update(gjson, info));
  if (sortir === SERR) {
    return;
  }
  lconfig = sortir[0], log = sortir[1];
  log.dry('err', metadata.version);
  return most.generate(ms_create_watch, lconfig, info, log).recoverWith(function(sig){
    resolve_signal(sig, log, info);
    return most.empty();
  }).drain();
};
main = function(cmd_data){
  return function(CONF){
    var project_name, service_directory, config_file_name, wcf, x$, info, y$;
    project_name = cmd_data.project.value();
    if (project_name) {
      service_directory = CONF.service_directory;
      config_file_name = service_directory + project_name + "/" + CONFIG_FILE_NAME;
      project_name = service_directory + project_name;
    } else {
      config_file_name = "./" + CONFIG_FILE_NAME;
      project_name = process.cwd();
    }
    if (!fs.existsSync(config_file_name)) {
      l(c.er3("[" + metadata.name + "]"), c.er3("• Error •"), c.er1("project/folder"), c.warn(project_name), c.er1("does not have a"), c.warn(CONFIG_FILE_NAME), c.er1("file."));
      l("\n   ", c.er3(config_file_name), 'missing.', "\n");
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
    y$.concat = concatenate;
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
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}