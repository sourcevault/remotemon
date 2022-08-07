#!/usr/bin/env node

var ref$, global_data, com, print, readJson, most, exec, chokidar, most_create, fs, metadata, optionParser, tampax, readline, emphasize, child_process, rm_empty_lines, path, dotpat, spawn, yaml, compare_version, boxen, moment, l, z, zj, j, R, lit, c, wait, noop, jspc, be, guard, cp, os, homedir, release, re, isWSL, CONFIG_FILE_NAME, cmd_data, question_init, rest, E, str, silent, edit, concatenate, isvar, check_if_number, vars, args, init, V, defarg_main, san_inpwd, san_obj, san_arr, san_user_script, run_script, x$, gs_path, y$, z$, get_str_type, handle_path_dot, symbol_script, rm_merge_key, san_defarg, update_defarg, yaml_parse, re_curly, get_curly, tampax_abs, clear, merge_ref_defarg, check_if_circular_ref, replace_dot, pathops, modyaml, parseDoc, show, nPromise, rmdef, only_str, SERR, OK, tampax_parse, mergeArray, unu, is_false, is_true, ifTrue, san_remotefold, rsync_arr2obj, ifrsh, organize_rsync, dangling_colon, san_path, handle_ssh, str_to_num, disp, zero, check_if_empty, create_logger, update, init_continuation, arrToStr, create_rsync_cmd, exec_finale, exec_rsync, bko, check_if_remote_not_defined, check_if_remotehost_present, check_if_remotedir_present, remote_main_proc, onchange, diff, handle_inf, resolve_signal, save_failed_build, print_final_message, restart, ms_create_watch, check_conf_file, if_current_hist_empty, getunique, exec_list_hist, start_from_resume_point, get_all, rm_resume, main, slice$ = [].slice, arrayFrom$ = Array.from || function(x){return slice$.call(x);};
ref$ = require("./data"), global_data = ref$.global_data, com = ref$.com, print = ref$.print;
readJson = com.readJson, most = com.most, exec = com.exec, chokidar = com.chokidar, most_create = com.most_create;
fs = com.fs, metadata = com.metadata, optionParser = com.optionParser, tampax = com.tampax, readline = com.readline;
emphasize = com.emphasize, child_process = com.child_process, rm_empty_lines = com.rm_empty_lines, path = com.path;
dotpat = com.dotpat, spawn = com.spawn, yaml = com.yaml, compare_version = com.compare_version, boxen = com.boxen, moment = com.moment;
ref$ = com.hoplon.utils, l = ref$.l, z = ref$.z, zj = ref$.zj, j = ref$.j, R = ref$.R, lit = ref$.lit, c = ref$.c, wait = ref$.wait, noop = ref$.noop, jspc = ref$.jspc;
be = com.hoplon.types;
guard = com.hoplon.guard;
cp = child_process;
os = require('os');
homedir = os.homedir();
release = os.release();
re = /Microsoft/g;
if (release.match(re)) {
  isWSL = true;
}
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
cmd_data.addOption('r', 'resume', null, 'resume');
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
try {
  rest = cmd_data.parse();
} catch (e$) {
  E = e$;
  print.optionParser(R.drop(2, process.argv));
  return;
}
if (cmd_data.help.count() > 0) {
  str = "" + metadata.name + " version " + metadata.version + "\n\noptions:\n\n  -v --verbose               more detail\n\n  -vv                        much more detail\n\n  -h --help                  display help message\n\n  -V --version               displays version number\n\n  -d --dry-run               perform a trial run without making any changes\n\n  -w --watch-config-file     restart on config file change\n\n  -c --cat                   dump the output of the current " + CONFIG_FILE_NAME + " being used\n\n  -cc                        same as -c but with comments\n\n  -ccc                       show raw json for final process state\n\n  -l --list                  list all user commands\n\n  -ll                        show history of all commands called\n\n  -m --auto-make-directory   make remote directory if it doesn't exist ( with user permission )\n\n     -mm                     ( with root permission )\n\n  -n --no-watch              force disable any and all watches\n\n  -s --silent                do not show " + metadata.name + " messages\n\n  -e --edit                  make permanent edits to " + CONFIG_FILE_NAME + " values\n\n  -p --project               folder name to look for " + CONFIG_FILE_NAME + "\n\n  -r --resume                resume from failpoint if remotemon can pattern match command with older build failure\n\n  ---- shorthands ----\n\n  CF <-- for configuration file\n\nvalues for internal variables (using .var object) can be changed using '=' (similar to makefiles) :\n\n> " + metadata.name + " --verbose file=dist/main.js\n\n[ documentation ] @ [ " + metadata.homepage + " ]\n";
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
init = function*(){
  var CONFIG_DIR, REMOTEMON_DIR, CONFIG_FILE, DEF_CONFIG_FILE, HIST_FILE, DEF_HIST_FILE, config_yaml_text, doc, service_dir, edit_config_file, q, str, ref$, str1, str2, lastchecktime, current_version_number, epoc, time_in_seconds, re, raw, ret, vn, corde, user_doc, prog_doc, fin_doc;
  CONFIG_DIR = homedir + "/.config";
  REMOTEMON_DIR = CONFIG_DIR + "/remotemon/";
  CONFIG_FILE = REMOTEMON_DIR + "config.remotemon.yaml";
  DEF_CONFIG_FILE = path.resolve(__dirname + '/../config.remotemon.yaml');
  HIST_FILE = REMOTEMON_DIR + "hist.json";
  DEF_HIST_FILE = path.resolve(__dirname + '/../hist.json');
  if (!fs.existsSync(CONFIG_DIR)) {
    exec("mkdir " + CONFIG_DIR);
  }
  if (!fs.existsSync(REMOTEMON_DIR)) {
    exec("mkdir " + REMOTEMON_DIR);
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    exec("cp " + DEF_CONFIG_FILE + " " + REMOTEMON_DIR);
  }
  if (!fs.existsSync(HIST_FILE)) {
    exec("cp " + DEF_HIST_FILE + " " + REMOTEMON_DIR);
  }
  config_yaml_text = R.toString(
  fs.readFileSync(
  CONFIG_FILE));
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
    str2 = c.grey("can be changed anytime by editing ") + c.warn(CONFIG_FILE);
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
    if (compare_version(vn, metadata.version) === 1) {
      doc.setIn(['last_check_time'], epoc);
      edit_config_file = true;
      process.on('exit', function(){
        var msg;
        msg = "update available " + c.er2(metadata.version) + c.ok((" ➝ " + vn) + "\n\n" + c.grey("> sudo npm i -g remotemon \n" + c.grey("> sudo yarn global add remotemon \n" + c.grey("> sudo pnpm add -g remotemon"))));
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
    wait(0, function(){
      return fs.writeFile(CONFIG_FILE, corde, function(err){
        return c.er1(err);
      });
    });
  }
  user_doc = doc.toJSON();
  prog_doc = yaml.parse(
  R.toString(
  fs.readFileSync(
  CONFIG_FILE)));
  fin_doc = R.mergeLeft(user_doc, prog_doc);
  fin_doc.HIST_FILE = HIST_FILE;
  return (yield fin_doc);
};
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
  var info, type, msg, path;
  info = arguments[arguments.length - 1];
  type = E[0], msg = E[1];
  switch (type) {
  case ':defarg.req':
    return print.defarg_req(msg, info.cmdname + " ");
  case ':defarg.type':
    // fallthrough
  default:
    path = [info.cmdname, 'defarg'];
    return print.basicError(msg, path, info.configfile);
  }
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
san_obj = be.obj.fix(function(){
  return {};
}).wrap();
san_arr = be.arr.fix(function(){
  return [];
});
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
  lines.shift();
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
    throw SERR;
  }
  user_lines = sortir.stdout.toString().split("\n");
  ref$ = san_user_script(user_lines), to_disp = ref$[0], to_exit = ref$[1];
  if (!(to_disp === '')) {
    console.log(to_disp);
  }
  return to_exit;
};
x$ = gs_path = {};
y$ = x$.js = {};
y$.loop = null;
y$.main = null;
z$ = x$.yl = {};
z$.loop = null;
z$.main = null;
x$.loop = null;
x$.main = null;
x$.yaml = null;
x$.shebang = /!#|#!/;
x$.tampax = /\{{.*}}/;
x$.linebreak = /\n/;
get_str_type = function(str){
  var has_shebang, has_expansion, has_linebreak, is_script, is_tampax;
  has_shebang = str.match(gs_path.shebang);
  has_expansion = str.match(gs_path.tampax);
  has_linebreak = str.match(gs_path.linebreak);
  is_script = false;
  is_tampax = false;
  if (has_shebang && has_linebreak) {
    is_script = true;
  }
  if (has_expansion) {
    is_tampax = true;
  }
  return [is_script, is_tampax];
};
handle_path_dot = {};
handle_path_dot.save = be.str.tap(function(index, path, hist){
  if (index.match("\\.")) {
    return hist.dotpath.push(arrayFrom$(path).concat([index]));
  }
}).alt(be.num).cont(function(index, path){
  return path.concat(index);
}).wrap();
handle_path_dot.save_matrix = function(path, yIndex, hist){
  var i$, len$, xIndex, each, results$ = [];
  for (i$ = 0, len$ = path.length; i$ < len$; ++i$) {
    xIndex = i$;
    each = path[i$];
    if (R.type(each) === 'String') {
      if (each.match("\\.")) {
        results$.push(hist.dotmatrix.push([yIndex, xIndex]));
      }
    }
  }
  return results$;
};
symbol_script = Symbol('is_script');
gs_path.js.loop = function(unknown, path, ref){
  var w, index, value, npath, i$, len$, spath, ref$, is_script, is_tampax, cmdname, index_name, results$ = [], results1$ = [];
  w = R.type(unknown);
  if (w === 'Object') {
    for (index in unknown) {
      value = unknown[index];
      npath = handle_path_dot.save(index, path, ref);
      results$.push(gs_path.js.loop(value, npath, ref));
    }
    return results$;
  } else if (w === 'Array') {
    for (i$ = 0, len$ = unknown.length; i$ < len$; ++i$) {
      index = i$;
      value = unknown[i$];
      npath = handle_path_dot.save(index, path, ref);
      results1$.push(gs_path.js.loop(value, npath, ref));
    }
    return results1$;
  } else {
    spath = path.join(".");
    if (!global_data.selected_keys.set.has(path[0]) && !(path[0] === ref.cmdname)) {
      return;
    }
    if (path[0] === 'defarg' || path[1] === 'defarg') {
      return;
    }
    ref.all[spath] = unknown;
    handle_path_dot.save_matrix(path, ref.pall.length, ref);
    ref.pall.push(path);
    if (w === 'String') {
      ref$ = get_str_type(unknown), is_script = ref$[0], is_tampax = ref$[1];
      if (is_script) {
        ref.script_all.push(spath);
        ref.script[spath] = path;
        unknown = symbol_script;
      }
      if (is_tampax) {
        ref.tampax[spath] = void 8;
        ref.tampax_all.push(path);
      }
    }
    if (path[0] === 'var') {
      ref.glovar[R.drop(1, path).join(".")] = unknown;
    }
    if (path[1] === 'var') {
      cmdname = path[0];
      index_name = R.join(".")(
      R.drop(2, path));
      return ref.cmdvar[index_name] = unknown;
    }
  }
};
gs_path.yl.loop = be(function(obj){
  var a;
  a = yaml.isMap(obj.value);
  return a;
}).tap(function(obj, type, path, ref){
  var items, i$, len$, each, p, results$ = [];
  items = obj.value.items;
  for (i$ = 0, len$ = items.length; i$ < len$; ++i$) {
    each = items[i$];
    p = arrayFrom$(path).concat([each.key.value]);
    results$.push(gs_path.yl.loop.auth(each, 'map', p, ref));
  }
  return results$;
}).or(be(function(obj){
  var b;
  b = yaml.isSeq(obj.value);
  return b;
}).tap(function(obj, type, path, ref){
  var items, i$, len$, index, each, p, results$ = [];
  items = obj.value.items;
  for (i$ = 0, len$ = items.length; i$ < len$; ++i$) {
    index = i$;
    each = items[i$];
    p = arrayFrom$(path).concat([index]);
    results$.push(gs_path.yl.loop.auth(each, 'seq', p, ref));
  }
  return results$;
})).or(be.tap(function(obj, type, path, ref){
  var sortir;
  switch (type) {
  case 'map':
    if (yaml.isAlias(obj.value)) {
      sortir = {
        alias: obj.value.source,
        path: path
      };
      ref.alias.push(sortir);
    }
    if (obj.value.anchor) {
      return ref.anchor[obj.value.anchor] = path.join('.');
    }
    break;
  case 'seq':
    if (obj.anchor) {
      return ref.anchor[obj.anchor] = path.join('.');
    }
  }
}));
gs_path.js.main = function(obj, cmdname){
  var x$, hist;
  x$ = hist = {};
  x$.script_all = [];
  x$.tampax = {};
  x$.tampax_all = [];
  x$.dotpath = [];
  x$.dotmatrix = [];
  x$.all = {};
  x$.pall = [];
  x$.glovar = {};
  x$.cmdvar = {};
  x$.script = {};
  x$.cmdname = cmdname;
  gs_path.js.loop(obj, [], hist);
  return hist;
};
gs_path.yl.main = function(obj){
  var x$, hist, ym, input;
  x$ = hist = {};
  x$.alias = [];
  x$.anchor = {};
  ym = obj.contents;
  input = {};
  input.value = obj.contents;
  gs_path.yl.loop.auth(input, 'map', [], hist);
  return hist;
};
gs_path.yl.find_cmd_name = function(contents){
  var all_top_values, i$, ref$, len$, each, only_cmds;
  all_top_values = [];
  for (i$ = 0, len$ = (ref$ = contents.items).length; i$ < len$; ++i$) {
    each = ref$[i$];
    all_top_values.push(each.key.value);
  }
  only_cmds = R.difference(all_top_values, global_data.selected_keys.arr);
  return only_cmds;
};
rm_merge_key = function(data){
  var clean, i$, ref$, len$, each, path, sortir, alias, p;
  clean = [];
  for (i$ = 0, len$ = (ref$ = data.alias).length; i$ < len$; ++i$) {
    each = ref$[i$];
    path = each.path;
    if (R.last(path) === '<<') {
      continue;
    }
    if (path[0] === 'var') {
      continue;
    }
    if (path[1] === 'var') {
      continue;
    }
    clean.push(each);
  }
  sortir = {};
  for (i$ = 0, len$ = clean.length; i$ < len$; ++i$) {
    ref$ = clean[i$], alias = ref$.alias, path = ref$.path;
    p = path.join('.');
    sortir[p] = alias;
  }
  return sortir;
};
san_defarg = function(js, info){
  return function(path){
    var dirty_defarg, defarg, arr;
    dirty_defarg = R.path(path, js);
    defarg = V.defarg.auth(dirty_defarg, info);
    if (defarg.error) {
      throw SERR;
    }
    arr = defarg.value[2];
    return arr;
  };
};
update_defarg = function(defarg, type){
  var i$, ref$, len$, index, str, ref1$, is_script, is_tampax;
  for (i$ = 0, len$ = (ref$ = defarg[type]).length; i$ < len$; ++i$) {
    index = i$;
    str = ref$[i$];
    if (R.type(str) !== 'String') {
      continue;
    }
    ref1$ = get_str_type(str), is_script = ref1$[0], is_tampax = ref1$[1];
    if (is_script) {
      defarg.script_all.push(type + '.' + index);
      defarg.script.add(type + "." + index);
    }
    if (is_tampax) {
      defarg.tampax_all.push([type, index]);
    }
  }
};
yaml_parse = function(doc, info){
  var js, E;
  try {
    doc.setSchema('1.1');
    js = doc.toJS();
    return js;
  } catch (e$) {
    E = e$;
    print.yaml_parse_fail(String(E), info);
    throw SERR;
  }
};
re_curly = /\{{([\w\.]*)}}/gm;
get_curly = function(str){
  var found, sortir;
  found = true;
  sortir = [];
  while (found) {
    found = re_curly.exec(str);
    if (found) {
      sortir.push(found[1]);
    }
  }
  return sortir;
};
tampax_abs = {};
clear = {};
merge_ref_defarg = function(defarg, ref){
  var nset, n_script_all, index, ref$, value, i$, len$, str, path, p, results$ = [];
  ref.project = defarg.project;
  ref.localpwd = defarg.localpwd;
  ref.globalpwd = defarg.globalpwd;
  nset = new Set(arrayFrom$(ref.script).concat(arrayFrom$(defarg.script)));
  ref.script = nset;
  n_script_all = arrayFrom$(defarg.script_all).concat(arrayFrom$(ref.script_all));
  ref.script_all = n_script_all;
  for (index in ref$ = defarg.tampax) {
    value = ref$[index];
    ref.tampax[index] = value;
  }
  for (i$ = 0, len$ = (ref$ = defarg.defarg).length; i$ < len$; ++i$) {
    index = i$;
    str = ref$[i$];
    ref.all['defarg.' + index] = str;
    path = ['defarg', index];
    ref.pall.push(path);
  }
  if (ref.cmdname) {
    p = ref.cmdname + '.defarg';
    for (i$ = 0, len$ = (ref$ = defarg[p]).length; i$ < len$; ++i$) {
      index = i$;
      str = ref$[i$];
      ref.all[p + '.' + index] = str;
      path = [ref.cmdname, 'defarg', index];
      handle_path_dot.save_matrix(path, ref.pall.length, ref);
      results$.push(ref.pall.push(path));
    }
    return results$;
  }
};
clear.tampax = function(name, ref, path){
  var expansions, str, i$, len$, each, has_tampax, is_script, exists, save, istr;
  expansions = ref.tampax[name];
  str = ref.all[name];
  for (i$ = 0, len$ = expansions.length; i$ < len$; ++i$) {
    each = expansions[i$];
    has_tampax = Boolean(ref.tampax[each]);
    is_script = ref.script[each];
    exists = ref.all[each];
    if (is_script) {
      save = "[" + each + ":script]";
    } else if (has_tampax) {
      if (!path.has(each)) {
        istr = clear.tampax(each, ref, new Set(arrayFrom$(path).concat([each])));
      } else {
        istr = "[" + each + ":loop]";
      }
      save = istr;
    } else if (exists) {
      save = exists;
    } else {
      save = "[" + each + ":void]";
    }
    str = str.replace("{{" + each + "}}", save);
  }
  return str;
};
clear.tampax_fin = function(name, ref, path){
  var expansion, str, i$, len$, each, has_tampax, exists, save;
  expansion = ref.tampax[name];
  str = ref.all[name];
  for (i$ = 0, len$ = expansion.length; i$ < len$; ++i$) {
    each = expansion[i$];
    has_tampax = Boolean(ref.tampax[each]);
    exists = ref.all[each];
    if (has_tampax) {
      if (!path.has(each)) {
        save = clear.tampax(each, ref, new Set(arrayFrom$(path).concat([each])));
      } else {
        save = "[" + each + ":loop]";
      }
    } else if (exists) {
      save = exists;
    } else {
      save = "[" + each + ":void]";
    }
    str = str.replace("{{" + each + "}}", save);
  }
  ref.all[name] = str;
};
clear.script = function(ref){
  var script_all, i$, len$, each, has_tampax, exists, script_text, init, pwd, val, tampax, results$ = [];
  script_all = ref.script_all;
  for (i$ = 0, len$ = script_all.length; i$ < len$; ++i$) {
    each = script_all[i$];
    has_tampax = ref.tampax[each];
    exists = ref.all[each];
    if (has_tampax) {
      script_text = clear.tampax(each, ref, new Set([each]));
    } else {
      script_text = exists;
    }
    init = each.split('.')[0];
    if (init === ref.cmdname) {
      pwd = ref.localpwd;
    } else {
      pwd = ref.globalpwd;
    }
    val = run_script(script_text, pwd, ref.project, each);
    ref.all[each] = val;
    ref.script[each] = void 8;
    delete ref.tampax[each];
  }
  tampax = ref.tampax;
  for (each in tampax) {
    results$.push(clear.tampax_fin(each, ref, new Set([each])));
  }
  return results$;
};
tampax_abs.defarg = function(defarg, ref){
  var local_path, i$, ref$, len$, each, loc, index, varspace, link, num_link, str, matches, allspace, rep, j$, len1$, I, found, rstr, ifnum;
  local_path = ref.cmdname + ".defarg";
  for (i$ = 0, len$ = (ref$ = defarg.tampax_all).length; i$ < len$; ++i$) {
    each = ref$[i$];
    loc = each[0], index = each[1];
    switch (loc) {
    case 'defarg':
      varspace = ref.glovar;
      link = "var.";
      num_link = "defarg.";
      break;
    case local_path:
      varspace = ref.cmdvar;
      link = ref.cmdname + ".var.";
      num_link = ref.cmdname + ".defarg.";
    }
    str = defarg[loc][index];
    matches = get_curly(str);
    allspace = ref.all;
    rep = [];
    for (j$ = 0, len1$ = matches.length; j$ < len1$; ++j$) {
      I = matches[j$];
      found = varspace[I];
      if (found) {
        rstr = link + I;
        rep.push(rstr);
        str = str.replace("{{" + I + "}}", "{{" + rstr + "}}");
        defarg[loc][index] = str;
      } else {
        found = allspace[I];
        rstr = I;
        ifnum = parseInt(I);
        if (!found) {
          if (ifnum === 0 || ifnum) {
            rstr = num_link + ifnum;
            str = str.replace("{{" + I + "}}", "{{" + rstr + "}}");
            defarg[loc][index] = str;
          } else if (loc === local_path) {
            found = ref.glovar[I];
            if (found) {
              rstr = "var." + I;
              str = str.replace("{{" + I + "}}", "{{" + rstr + "}}");
              defarg[loc][index] = str;
            }
          }
        }
        rep.push(rstr);
      }
    }
    defarg.tampax[each.join('.')] = rep;
  }
  return ref$ = defarg.tampax_all, delete defarg.tampax_all, ref$;
};
tampax_abs.ref = function(defarg, ref){
  var cmdname, i$, ref$, len$, each, loc, index, varspace, link, num_link, p, str, matches, allspace, rep, j$, len1$, I, found, rstr, ifnum;
  cmdname = ref.cmdname;
  for (i$ = 0, len$ = (ref$ = ref.tampax_all).length; i$ < len$; ++i$) {
    each = ref$[i$];
    loc = each[0], index = each[1];
    switch (loc) {
    case cmdname:
      varspace = ref.cmdvar;
      link = ref.cmdname + '.var.';
      num_link = ref.cmdname + ".defarg.";
      break;
    default:
      varspace = ref.glovar;
      link = 'var.';
      num_link = "defarg.";
    }
    p = each.join(".");
    str = ref.all[p];
    matches = get_curly(str);
    allspace = ref.all;
    rep = [];
    for (j$ = 0, len1$ = matches.length; j$ < len1$; ++j$) {
      I = matches[j$];
      found = varspace[I];
      if (found) {
        rstr = link + I;
        rep.push(rstr);
        str = str.replace("{{" + I + "}}", "{{" + rstr + "}}");
        ref.all[p] = str;
      } else {
        found = allspace[I];
        rstr = I;
        ifnum = parseInt(I);
        if (!found) {
          if (ifnum === 0 || ifnum) {
            rstr = num_link + ifnum;
            str = str.replace("{{" + I + "}}", "{{" + rstr + "}}");
            ref.all[p] = str;
          } else if (loc === cmdname) {
            found = ref.glovar[I];
            if (found) {
              rstr = "var." + I;
              str = str.replace("{{" + I + "}}", "{{" + rstr + "}}");
              ref.all[p] = str;
            }
          }
        }
        rep.push(rstr);
      }
    }
    ref.tampax[p] = rep;
  }
  return ref$ = ref.tampax_all, delete ref.tampax_all, ref$;
};
check_if_circular_ref = function(defarg, ref){
  var each, ref$, item, i$, len$, I, loc, matches;
  for (each in ref$ = defarg.tampax) {
    item = ref$[each];
    for (i$ = 0, len$ = item.length; i$ < len$; ++i$) {
      I = item[i$];
      if (I === each) {
        print.circular_ref(I);
        throw SERR;
      }
    }
  }
  for (loc in ref$ = ref.tampax) {
    matches = ref$[loc];
    for (i$ = 0, len$ = matches.length; i$ < len$; ++i$) {
      each = matches[i$];
      if (loc === each) {
        print.circular_ref(loc);
        throw SERR;
      }
    }
  }
};
replace_dot = {};
replace_dot.encode = function(ref){
  var i$, ref$, len$, ref1$, yAxis, xAxis, path, str, nstr, oldpath, npath, val, results$ = [];
  for (i$ = 0, len$ = (ref$ = ref.dotmatrix).length; i$ < len$; ++i$) {
    ref1$ = ref$[i$], yAxis = ref1$[0], xAxis = ref1$[1];
    path = ref.pall[yAxis];
    str = path[xAxis];
    nstr = R.join(": ")(
    R.split(".")(
    str));
    oldpath = path.join('.');
    path[xAxis] = nstr;
    npath = path.join('.');
    val = ref.all[oldpath];
    delete ref.all[oldpath];
    results$.push(ref.all[npath] = val);
  }
  return results$;
};
pathops = guard.ar(2, function(path, obj){
  return pathops(path, obj, '', 'del');
}).ar(3, function(path, obj, str){
  return pathops(path, obj, str, 'mod');
}).def(function(path, obj, str, type){
  var ou, lastname, i$, to$, I;
  ou = obj;
  lastname = path[path.length - 1];
  for (i$ = 0, to$ = path.length - 1; i$ < to$; ++i$) {
    I = i$;
    ou = ou[path[I]];
  }
  switch (type) {
  case 'del':
    delete ou[lastname];
    break;
  case 'mod':
    ou[lastname] = str;
  }
  return obj;
});
replace_dot.decode = function(ref, js){
  var i$, ref$, len$, each, ref1$, newpath, last, nstr, val;
  for (i$ = 0, len$ = (ref$ = ref.dotpath).length; i$ < len$; ++i$) {
    each = ref$[i$];
    ref1$ = R.splitAt(-1, each), newpath = ref1$[0], last = ref1$[1];
    nstr = R.join(": ")(
    R.split(".")(
    last[0]));
    newpath.push(nstr);
    val = R.path(newpath, js);
    pathops(each, js, val);
    pathops(newpath, js);
  }
  return js;
};
modyaml = function*(info){
  var configfile, data, doc, allcmdnames, cmd_equ_func, is_cmd, nominal_path, cmdname, i$, ref$, len$, ref1$, key, value, p_cmdvar, p_empty, init, p, alt_p, v_path, d_path, js_all, js, sk, index, ref, path, defarg, sd, inpwd, a_path, cd, clean_data;
  configfile = info.configfile;
  data = R.toString(
  fs.readFileSync(
  configfile));
  doc = parseDoc(data, info);
  allcmdnames = gs_path.yl.find_cmd_name(doc.contents);
  cmd_equ_func = R.equals(
  args[0]);
  is_cmd = R.find(cmd_equ_func, allcmdnames);
  if (is_cmd) {
    info.cmdname = args[0];
    info.cmdargs = R.drop(1, args);
  } else {
    info.cmdname = void 8;
    info.cmdargs = args;
  }
  nominal_path = null;
  cmdname = info.cmdname;
  if (cmdname === undefined) {
    for (i$ = 0, len$ = (ref$ = info.vars).length; i$ < len$; ++i$) {
      ref1$ = ref$[i$], key = ref1$[0], value = ref1$[1];
      if (key[0] === 'var') {
        key.shift();
      }
      doc.setIn(['var'].concat(arrayFrom$(key)), value);
    }
    nominal_path = [];
  } else {
    p_cmdvar = [cmdname, 'var'];
    p_empty = [];
    for (i$ = 0, len$ = (ref$ = info.vars).length; i$ < len$; ++i$) {
      ref1$ = ref$[i$], key = ref1$[0], value = ref1$[1];
      if (key[0] === 'var') {
        init = p_empty;
        p = key;
      } else {
        init = p_cmdvar;
        p = arrayFrom$(init).concat(arrayFrom$(key));
        alt_p = ['var'].concat(arrayFrom$(key));
        if (doc.getIn(p) === undefined && doc.getIn(alt_p)) {
          p = alt_p;
        }
      }
      doc.setIn(p, value);
    }
    nominal_path = [cmdname];
  }
  v_path = arrayFrom$(nominal_path).concat(['var']);
  d_path = arrayFrom$(nominal_path).concat(['defarg']);
  js_all = yaml_parse(doc, info);
  js = {};
  if (info.options.edit || info.options.list) {
    return [js_all, doc];
  }
  sk = global_data.selected_keys.set;
  for (index in js_all) {
    value = js_all[index];
    if (sk.has(index) || index === cmdname) {
      js[index] = value;
    }
  }
  ref = gs_path.js.main(js, cmdname);
  for (index in ref$ = ref.script) {
    path = ref$[index];
    if (!(((ref1$ = path[0]) === 'var' || ref1$ === 'defarg') || ((ref1$ = path[1]) === 'var' || ref1$ === 'defarg'))) {
      print.script_in_wrong_place(index);
      throw SERR;
    }
  }
  defarg = {};
  defarg.project = info.options.project;
  defarg.defarg = null;
  if (ref.cmdname) {
    defarg[ref.cmdname + '.defarg'] = {};
  }
  defarg.localpwd = null;
  defarg.globalpwd = null;
  defarg.script_all = [];
  defarg.script = new Set();
  defarg.tampax = {};
  defarg.tampax_all = [];
  sd = san_defarg(js, info);
  defarg.defarg = sd(['defarg']);
  defarg.globalpwd = san_inpwd(js.inpwd, info.options.inpwd);
  if (cmdname) {
    if (global_data.selected_keys.set.has(cmdname)) {
      print.in_selected_key(cmdname, info.cmdline);
      throw SERR;
    }
    if (!js[cmdname]) {
      print.could_not_find_custom_cmd(cmdname, info);
      throw SERR;
    }
    inpwd = san_inpwd(js[cmdname].inpwd, js.inpwd);
    defarg.localpwd = inpwd;
    a_path = [cmdname, 'defarg'];
    p = cmdname + '.defarg';
    defarg[p] = sd(a_path);
    update_defarg(defarg, p);
  } else {
    update_defarg(defarg, 'defarg');
  }
  tampax_abs.defarg(defarg, ref);
  tampax_abs.ref(defarg, ref);
  delete ref.glovar;
  delete ref.cmdvar;
  check_if_circular_ref(defarg, ref);
  merge_ref_defarg(defarg, ref);
  clear.script(ref);
  replace_dot.encode(ref);
  cd = com.hoplon.utils.flat.unflatten(ref.all);
  clean_data = replace_dot.decode(ref, cd);
  return [clean_data, doc];
};
parseDoc = function(data, info){
  var doc, error;
  doc = yaml.parseDocument(data);
  error = doc.errors[0];
  if (error) {
    print.yaml_parse_fail(error.toString(), info);
    throw SERR;
  }
  if (!doc.contents) {
    print.yaml_parse_fail('yaml file is empty.\n', info);
    throw SERR;
  }
  return doc;
};
show = R.tap(function(ob){
  console.log([ob]);
});
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
  l(lit(['> FILE ', info.configfile], [c.er2, c.blue]));
  keys = Object.keys(yjson);
  user_ones = rmdef(keys);
  if (user_ones.length === 0) {
    l(lit(["  --- ", "< EMPTY USER CMD >", " ---"], [c.pink, c.er2, c.pink]));
  }
  for (i$ = 0, to$ = user_ones.length; i$ < to$; ++i$) {
    I = i$;
    name = user_ones[I];
    des = only_str(yjson[name].description);
    results$.push(l(lit([" • ", name, des], [c.warn, c.warn, c.grey])));
  }
  return results$;
}
function exec_cat_option(yaml_object, concat_count, info){
  var yaml_text, hash_first, lines, interm, i$, len$, I, text;
  yaml_text = yaml_object.toString();
  hash_first = RegExp('^#');
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
  return l(info.libs.emphasize.highlightAuto(text).value);
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
  var sortie, type, msg;
  sortie = be.flatro(all);
  type = sortie[0], msg = sortie[1];
  switch (type) {
  case ':ob_in_str_list':
    return msg;
  default:
    return "not string or string list.";
  }
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
ifTrue = function(type){
  return function(){
    var state, val;
    state = arguments[arguments.length - 1];
    val = state.origin[type];
    if (Boolean(val)) {
      return val;
    } else {
      return state.info.options[type];
    }
  };
};
V.watch = {};
V.watch.main = V.rsl.or(be.undefnull.alt(V.isFalse).cont(function(){
  return [];
}));
V.watch.def = V.watch.main.or(V.isTrue.cont(function(){
  var state;
  state = arguments[arguments.length - 1];
  return state.info.options.watch;
}));
V.watch.user = V.watch.main.or(V.isTrue.cont(ifTrue('watch')));
V.ignore = {};
V.ignore.def = V.watch.main.or(V.isTrue.cont(function(){
  var state;
  state = arguments[arguments.length - 1];
  return state.info.options.ignore;
}));
V.ignore.user = V.watch.main.or(V.isTrue.cont(ifTrue('ignore')));
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
  var rsync, ref$, msg, index, tosend, i$, len$, each, path;
  rsync = data.rsync;
  if (rsync === false) {
    return true;
  }
  if (rsync.error) {
    ref$ = rsync.error, msg = ref$[0], index = ref$[1];
    tosend = [false, [':rsync', msg], ['rsync'].concat(arrayFrom$(index))];
    return tosend;
  }
  for (i$ = 0, len$ = rsync.length; i$ < len$; ++i$) {
    index = i$;
    each = rsync[i$];
    if (R.type(each.des) !== 'String') {
      msg = [".des is not defined. maybe remotefold is not defined."];
      path = R.slice(1, -1, arguments);
      tosend = [false, [':rsync', ['uno', msg]], ['rsync', index, 'des']];
      return tosend;
    }
  }
  return true;
};
san_remotefold = function(data, cmdname){
  var st;
  if (R.type(data.remotefold) !== 'String') {
    st = {};
    st.error = [['def', "remotefold is undefined (unable to substitute .des in rsync).", [cmdname, 'remotefold']], []];
    return [SERR, st];
  }
  return [OK];
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
          error.push(['duo', ['des', "has to be string type."]], [index]);
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
    if (st === SERR) {
      return data;
    }
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
        ssh = [['rsh', "ssh " + st.ate.origin.ssh.option]];
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
dangling_colon = be.arr.cont(function(arr){
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
}).or(be.str).wrap();
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
san_path = function(path){
  return path;
};
V.def_ssh = V.ssh.cont(function(ob){
  var state, origin, path, tsel;
  state = arguments[arguments.length - 1];
  origin = state.origin;
  if (ob.startwith.length === 0) {
    path = san_path(origin.remotefold);
    tsel = "cd " + path + ";";
    ob.startwith.push(tsel);
  }
  if (ob.option === void 8) {
    ob.option = state.info.options.ssh.option;
  }
  ob.startwith = dangling_colon(ob.startwith);
  return ob;
});
V.user_ssh = V.ssh;
handle_ssh = function(user, def){
  var path, tsel;
  if (user.ssh.startwith.length === 0) {
    if (user.remotefold) {
      path = san_path(user.remotefold);
      tsel = "cd " + path;
      user.ssh.startwith.push(tsel);
    } else {
      user.ssh.startwith = def.ssh.startwith;
    }
  }
  user.ssh.startwith = dangling_colon(user.ssh.startwith);
  if (!user.ssh.option) {
    user.ssh.option = def.ssh.option;
  }
};
V.def_vars = be.obj.or(be.undefnull.cont(function(){
  return {};
}));
V.user_vars = V.def_vars.cont(function(ob){
  var state, out;
  state = arguments[arguments.length - 1];
  out = R.mergeDeepLeft(ob, state.origin['var']);
  return out;
});
str_to_num = be.str.cont(function(str){
  return Number(str);
}).and(be.int.pos).or(be.int.pos).err('not number');
V.defarg_required = str_to_num.or(be.undefnull.cont(function(obj){
  var state, defarg, max_null, i$, len$, I;
  state = arguments[arguments.length - 1];
  if (arguments.length === 4) {
    defarg = state.origin[arguments[2]].defarg;
  } else if (arguments.length === 3) {
    defarg = state.origin.defarg;
  }
  if (!defarg) {
    defarg = [];
  }
  max_null = 0;
  for (i$ = 0, len$ = defarg.length; i$ < len$; ++i$) {
    I = defarg[i$];
    if (I === null) {
      max_null += 1;
    } else {
      break;
    }
  }
  return max_null;
}));
V.user = be.obj.err("custom user defined task, has to be object.").or(be.undefnull.cont(function(){
  return {};
})).and(be.restricted(global_data.selected_keys.arr)).err("key not recognized.").alt(V.strlist.empty.cont(function(list){
  return {
    'local': list
  };
})).on(['initialize', 'inpwd', 'silent'], be.bool.or(unu)).on('watch', V.watch.user).on('defarg', san_arr).on('verbose', str_to_num.or(unu)).on('ignore', V.ignore.user).on(['pre', 'remote', 'local', 'final'], V.execlist).on('rsync', V.rsync.init).on('defarg.required', V.defarg_required).on(['remotehost', 'remotefold'], be.str.or(unu.cont(function(v, key){
  var origin;
  origin = arguments[arguments.length - 1].origin;
  return origin[key];
}))).cont(organize_rsync).and(V.rsync.throw_if_error).on('ssh', V.user_ssh).on('var', V.user_vars);
disp = function(num){
  return function(){
    return console.log(num);
  };
};
V.def = be.obj.on(['remotehost', 'remotefold'], be.str.or(unu)).on(['inpwd', 'silent'], be.bool.or(be.undefnull.cont(false))).on('verbose', str_to_num.or(be.undefnull.cont(0))).on('initialize', be.bool.or(be.undefnull.cont(true))).on('watch', V.watch.def).on('defarg', san_arr).on('defarg.required', V.defarg_required).on('ignore', V.ignore.def).on(['pre', 'local', 'final', 'remote'], V.execlist).on('rsync', V.rsync.init).on('var', V.def_vars).cont(organize_rsync).and(V.rsync.throw_if_error).on('ssh', V.def_ssh).map(function(value, key){
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
}).and(function(){
  var info;
  info = arguments[arguments.length - 1].info;
  if (info.options.concat === 3) {
    return [false, [':concat']];
  }
  return true;
}).err(function(message, path, val){
  var info, sortir, topmsg, loc, Error, F, libs, clone, print_json;
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
    case ':concat':
      return noop;
    default:
      Error = Error[0];
      return print.basicError;
    }
  }());
  if (info.options.concat === 3) {
    libs = info.libs;
    clone = R.clone(info);
    clone.libs = void 8;
    print_json = function(json){
      return l(libs.emphasize.highlight('json', j(json)).value);
    };
    print_json(clone);
    l("-------------");
    print_json(val);
  }
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
  var add, vout, ref$, lconfig, log, buildname;
  add = {
    def: {},
    user: {},
    origin: gjson,
    info: info
  };
  vout = V.def.auth(gjson, add);
  if (vout.error) {
    return SERR;
  }
  gjson = vout.value;
  ref$ = create_logger(info, gjson), lconfig = ref$[0], log = ref$[1], buildname = ref$[2];
  if (info.options.watch_config_file) {
    lconfig.watch.unshift(info.configfile);
  }
  return [lconfig, log, buildname];
};
init_continuation = function(dryRun, dir, inpwd){
  return function*(cmd, location, type){
    var status, sortir;
    location == null && (location = []);
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
          return reject([cmd, location]);
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
  var txt, str, obnormal, obarr, des, src, i$, len$, I, ref$, key, val, tsel, cmd;
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
  tsel = remotehost + ":" + des;
  cmd = "rsync " + txt + arrToStr(src) + tsel;
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
exec_finale = function*(data){
  var info, lconfig, log, cont, postscript, i$, len$, index, cmd, results$ = [];
  info = data.info, lconfig = data.lconfig, log = data.log, cont = data.cont;
  postscript = lconfig['final'];
  log.normal(postscript.length, 'ok', " final", c.warn(postscript.length + ""));
  for (i$ = 0, len$ = postscript.length; i$ < len$; ++i$) {
    index = i$;
    cmd = postscript[i$];
    log.verbose(cmd);
    results$.push((yield* cont(cmd, ['final', index])));
  }
  return results$;
};
exec_rsync = function*(data, each, index){
  var info, lconfig, log, cont, remotehost, remotefold, cmd, disp, status;
  info = data.info, lconfig = data.lconfig, log = data.log, cont = data.cont;
  remotehost = lconfig.remotehost, remotefold = lconfig.remotefold;
  cmd = create_rsync_cmd(each, remotehost);
  disp = lit([remotehost + ":" + each.des, c.warn(" <- "), each.src.join(" , ")], [c.grey, c.warn, c.grey]);
  log.normal(true, 'ok', lit(["sync", " start"], [0, c.warn]), c.grey(disp));
  log.verbose("rsync ... ", cmd);
  status = (yield* cont(cmd, ['rsync', index], 'sync'));
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
check_if_remote_not_defined = bko.on([['and', 'remote', be.arr.and(be.not(zero))], ['alt', ['remotehost', 'remotefold'], be.undefnull]]).cont(true).fix(false).wrap();
check_if_remotehost_present = function*(data){
  var lconfig, log, cont, tryToSSH, E;
  lconfig = data.lconfig, log = data.log, cont = data.cont;
  tryToSSH = "ssh " + lconfig.ssh.option + " " + lconfig.remotehost + " 'ls'";
  try {
    exec(tryToSSH);
  } catch (e$) {
    E = e$;
    log.normal('err', lit(["unable to ssh to remote address '", lconfig.remotehost, "'."], [c.er1, c.er2, c.er1]));
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
      (yield* cont(mkdir, []));
      return log.normal('ok', "remote", lit([' ✔️ ok •', " " + lconfig.remotehost + ":" + lconfig.remotefold + " ", "created with ", msg + "", " permissions."], [c.ok, c.warn, c.grey, c.ok, c.grey]));
    }
  }
};
remote_main_proc = function*(data, remotetask){
  var lconfig, log, cont, info, remotehost, remotefold, disp, i$, len$, index, I, cmd, results$ = [];
  lconfig = data.lconfig, log = data.log, cont = data.cont, info = data.info;
  remotehost = lconfig.remotehost, remotefold = lconfig.remotefold;
  disp = lit([remotetask.length + " ", "• ", remotehost + ":" + remotefold], [c.warn, c.ok, c.grey]);
  log.normal(remotetask.length, 'ok', "remote", disp);
  for (i$ = 0, len$ = remotetask.length; i$ < len$; ++i$) {
    index = i$;
    I = remotetask[i$];
    cmd = "ssh " + lconfig.ssh.option + " " + remotehost + " '" + lconfig.ssh.startwith + " " + I + "'";
    log.verbose(I, cmd);
    results$.push((yield* cont(cmd, ['remote', index])));
  }
  return results$;
};
onchange = function*(data){
  var info, lconfig, log, cont, req, remotehost, remotefold, local, remotetask, i$, len$, index, cmd, ref$, each;
  info = data.info, lconfig = data.lconfig, log = data.log, cont = data.cont;
  req = lconfig['defarg.required'];
  if (req > info.cmdargs.length) {
    print.defarg_req(req, info.cmdname + " ");
    (yield 'error');
    return;
  }
  if (check_if_remote_not_defined(lconfig)) {
    log.normal('err', " ⚡️⚡️ error", c.er2(".remotehost/.remotefold ( required for task ) not defined."));
    (yield 'error');
    return;
  }
  if (check_if_empty(lconfig)) {
    log.normal('err', "⚡️⚡️ error", c.er1("empty execution, no command to execute / unable to find user command."));
    (yield 'error#empty_exec');
    return;
  }
  remotehost = lconfig.remotehost, remotefold = lconfig.remotefold;
  local = lconfig.local;
  remotetask = lconfig.remote;
  log.normal(local.length, 'ok', "local", c.warn(local.length + ""));
  for (i$ = 0, len$ = local.length; i$ < len$; ++i$) {
    index = i$;
    cmd = local[i$];
    log.verbose(cmd);
    (yield* cont(cmd, ['local', index]));
  }
  if (lconfig.rsync || (remotetask.length && !info.options.dryRun)) {
    (yield* check_if_remotehost_present(data));
  }
  if (lconfig.rsync) {
    for (i$ = 0, len$ = (ref$ = lconfig.rsync).length; i$ < len$; ++i$) {
      index = i$;
      each = ref$[i$];
      (yield* exec_rsync(data, each, index));
    }
  }
  if (remotetask.length) {
    if (!info.options.dryRun) {
      (yield* check_if_remotedir_present(data));
    }
    (yield* remote_main_proc(data, remotetask));
  }
  (yield* exec_finale(data));
  (yield 'done');
};
diff = R.pipe(R.aperture(2), R.map(function(arg$){
  var x, y;
  x = arg$[0], y = arg$[1];
  return y - x;
}));
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
      fin.value = SERR;
    } else {
      fin.value = ob.value;
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
  var cmdtxt, location;
  cmdtxt = arg$[0], location = arg$[1];
  process.stdout.cursorTo(0);
  if (info.options.verbose === 2) {
    log.normal('err_light', "exit 1", cmdtxt);
  } else {
    log.normal('err_light', "exit 1");
  }
  return ['error#location', location];
}).or(be(function(x){
  return R.type(x) === 'Error';
}).cont(function(E){
  l('----');
  l(c.er2(E.stack));
  l('----');
  return [];
})).alt(be.str.cont(function(str){
  return [str];
})).cont(function(arg$){
  var sig, data;
  sig = arg$[0], data = arg$[1];
  return [sig.split('#'), data];
}).wrap();
save_failed_build = function(loc, info){
  var startpoint, alldata, pdata, patt, fail, last;
  startpoint = info.options.startpoint;
  if (info.options.resume) {
    if (loc[0] === startpoint[0]) {
      loc[1] = loc[1] + startpoint[1];
    }
  }
  alldata = JSON.parse(
  R.toString(
  fs.readFileSync(
  info.options.hist_file_address)));
  pdata = alldata[info.options.project];
  patt = info.cmdline.join(" ");
  fail = pdata.fail;
  if (!fail) {
    print.hist_file_corrupted(info.options.hist_file_address);
    return;
  }
  while (fail.length > info.histsize) {
    fail.shift();
  }
  last = R.last(fail);
  if (last && last[0] === patt) {
    fail.pop();
  }
  fail.push([patt, loc]);
  fs.writeFileSync(info.options.hist_file_address, jspc(alldata));
};
print_final_message = function(log, lconfig, info){
  return function(signal){
    var ref$, ref1$, sig, type, loc, msg, message_type;
    ref$ = resolve_signal(signal, log, info), ref1$ = ref$[0], sig = ref1$[0], type = ref1$[1], loc = ref$[1];
    if (info.options.watch_config_file) {
      msg = c.warn("returning to watch ") + c.pink("*CF");
    } else {
      msg = c.warn("returning to watch");
    }
    switch (sig) {
    case 'error':
      if (type === 'location') {
        save_failed_build(loc, info);
      }
      message_type = 'err';
      break;
    case 'done':
      message_type = 'ok';
    }
    if (signal === 'error#empty_exec' && !info.options.watch_config_file) {
      return SERR;
    }
    if (!lconfig.should_I_watch) {
      return SERR;
    }
    log.normal(message_type, msg);
    return OK;
  };
};
restart = {};
ms_create_watch = function*(lconfig, info, log){
  var should_I_watch, disp, I, ms_file_watch, cont, pre, i$, len$, index, cmd;
  should_I_watch = lconfig.watch.length > 0 && info.options.no_watch === 0;
  lconfig.should_I_watch = should_I_watch;
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
    var rl, cwd, watcher, dispose;
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
    if (lconfig.inpwd) {
      cwd = undefined;
      lconfig.CFname = info.configfile;
    } else {
      cwd = info.options.project;
      lconfig.CFname = '.remotemon.yaml';
    }
    if (should_I_watch) {
      watcher = chokidar.watch(lconfig.watch, {
        ignored: lconfig.ignore,
        awaitWriteFinish: true,
        ignorePermissionErrors: true,
        cwd: cwd
      });
      watcher.on('change', add);
      lconfig.watcher = watcher;
      dispose = function(){
        watcher.close();
        rl.close();
        end();
      };
    } else {
      dispose = function(){
        rl.close();
        end();
      };
    }
    return dispose;
  });
  cont = init_continuation(info.options.dryRun, info.options.project, lconfig.inpwd);
  pre = lconfig.pre;
  log.normal(pre.length, 'ok', "pre", c.warn(pre.length + ""));
  for (i$ = 0, len$ = pre.length; i$ < len$; ++i$) {
    index = i$;
    cmd = pre[i$];
    log.verbose(cmd);
    (yield* cont(cmd, ['pre', index]));
  }
  return ms_file_watch.timestamp().loop(handle_inf(log, lconfig), info.timedata).takeWhile(function(filename){
    if (filename === lconfig.CFname) {
      if (info.options.watch_config_file) {
        restart.stream(info, log, lconfig);
        return false;
      }
    }
    return true;
  }).chain(function(filename){
    var data;
    data = {
      info: info,
      lconfig: lconfig,
      log: log,
      cont: cont
    };
    return most.generate(onchange, data).recoverWith(function(x){
      return most.just(x);
    }).map(print_final_message(log, lconfig, info));
  }).takeWhile(function(sig){
    if (sig === SERR) {
      return false;
    }
    return true;
  }).drain();
};
restart.stream = function(info, log, lconfig){
  return most.generate(restart.main, info, log).subscribe({
    complete: function(SIG){
      if (SIG === OK) {
        return;
      }
      lconfig.initialize = false;
      return wait(0, function(){
        var msg;
        msg = lit([info.configfile + "", " <--parse error in file"], [c.warn, c.er3]);
        log.normal('err', msg);
        msg = lit(["setting up watch using using old configuration file.."], [c.er1]);
        log.normal('err', msg);
        return most.generate(ms_create_watch, lconfig, info, log).drain();
      });
    }
  });
};
restart.main = function*(info, log){
  var msg, gjson, E, sortir, lconfig, aout;
  msg = lit([info.configfile + "", " changed, restarting watch.."], [c.warn, c.er1]);
  log.normal('err', msg);
  try {
    gjson = (yield* modyaml(info))[0];
  } catch (e$) {
    E = e$;
    if (E === SERR) {
      return SERR;
    } else {
      l(c.er1(E));
      return;
    }
  }
  sortir = (yield* update(gjson, info));
  if (in$(sortir, SERR)) {
    return SERR;
  }
  lconfig = sortir[0], log = sortir[1];
  aout = most.generate(ms_create_watch, lconfig, info, log).drain();
  return OK;
};
V.CONF = be.known.obj.on('rsync', V.rsync.init).on('ssh', V.ssh).on('watch', be.undef.or(be.arr.or(be.str.cont(function(str){
  return [str];
})))).on('inpwd', be.undef.or(be.bool)).on('histsize', be.num.fix(100)).cont(organize_rsync).and(V.rsync.throw_if_error).err(function(message, path){
  var info, topmsg, loc, Error, F;
  info = arguments[arguments.length - 1];
  topmsg = be.flatro(message)[0];
  loc = topmsg[0], Error = topmsg[1];
  F = (function(){
    switch (loc) {
    case ':rsync':
      return print.rsyncError;
    default:
      Error = topmsg;
      return print.basicError;
    }
  }());
  return F(Error, path, "~/.config/config.remotemon.yaml");
});
check_conf_file = function(conf, info){
  var D, x$, origin, sortir;
  D = {};
  D.rsync = conf.rsync;
  D.ssh = conf.ssh;
  D.remotefold = '<CONF dummy / ignore>';
  D.histsize = conf.histsize;
  x$ = origin = {};
  x$.ssh = conf.ssh;
  sortir = V.CONF.auth(D, info.cmdname, {
    origin: origin,
    info: info
  });
  return sortir.error;
};
if_current_hist_empty = be.undef.alt(be.arr.and(function(a){
  return a.length === 0;
})).cont(true).fix(false).wrap();
getunique = R.uniqWith(function(arg$, arg1$){
  var _, cmd1, cmd2;
  _ = arg$[0], cmd1 = arg$[1];
  _ = arg1$[0], cmd2 = arg1$[1];
  return R.equals(cmd1, cmd2);
});
exec_list_hist = function(val, project_name){
  var path, current_hist, padLeft, fin_string, max_mid_len, max_time_len, i$, len$, index, ref$, time, cmd, mtime, date, rel_time, color, each, results$ = [];
  path = homedir + "/.config" + "/remotemon/" + "hist.json";
  val = JSON.parse(
  R.toString(
  fs.readFileSync(
  path)));
  l(lit(['> PROJECT ', project_name], [c.er2, c.blue]));
  current_hist = val[project_name].call;
  if (if_current_hist_empty(current_hist)) {
    l(lit([" --- ", "< EMPTY HISTORY >", " --- "], [c.pink, c.warn, c.pink]));
    return;
  }
  padLeft = com.hoplon.utils.pad.padLeft;
  current_hist = getunique(current_hist);
  fin_string = [];
  max_mid_len = 0;
  max_time_len = 0;
  for (i$ = 0, len$ = current_hist.length; i$ < len$; ++i$) {
    index = i$;
    ref$ = current_hist[i$], time = ref$[0], cmd = ref$[1];
    mtime = moment(time);
    date = mtime.format('MMM-DD');
    time = mtime.format('hA');
    rel_time = moment(mtime.format('YYYYMMDDkkmmss'), 'YYYYMMDDkkmmss').fromNow();
    if (time.length >= max_time_len) {
      max_time_len = time.length;
    }
    if (rel_time.length >= max_mid_len) {
      max_mid_len = rel_time.length;
    }
    fin_string.push([date, time, rel_time, cmd]);
  }
  color = [c.warn, c.er1];
  for (i$ = 0, len$ = fin_string.length; i$ < len$; ++i$) {
    index = i$;
    each = fin_string[i$];
    each[1] = padLeft(each[1], max_time_len, ' ');
    each[2] = padLeft(each[2], max_mid_len, ' ');
    results$.push(l(lit([each[0], ' ', each[1], ' ', each[2], ' ', each[3].join(' ')], [c.pink, null, c.pink, null, c.grey, null, color[index % 2]])));
  }
  return results$;
};
start_from_resume_point = function(lconfig, info){
  var ref$, point, index, order, torm, cont, i$, len$, each, __, tokeep;
  ref$ = info.options.startpoint, point = ref$[0], index = ref$[1];
  order = ['pre', 'local', 'rsync', 'remote', 'final'];
  ref$ = R.splitWhen(R.equals(point), order), torm = ref$[0], cont = ref$[1];
  for (i$ = 0, len$ = torm.length; i$ < len$; ++i$) {
    each = torm[i$];
    lconfig[each] = [];
  }
  ref$ = R.splitAt(index, lconfig[cont[0]]), __ = ref$[0], tokeep = ref$[1];
  lconfig[cont[0]] = tokeep;
  return lconfig;
};
get_all = function*(info){
  var pod, ref$, gjson, yaml_text, E, concat, sortir, lconfig, log;
  pod = (yield emphasize);
  info.libs.emphasize = pod.emphasize;
  pod = (yield boxen);
  info.libs.boxen = pod['default'];
  try {
    ref$ = (yield* modyaml(info)), gjson = ref$[0], yaml_text = ref$[1];
  } catch (e$) {
    E = e$;
    if (E === SERR) {
      return SERR;
    } else {
      l(c.er1(E));
      return;
    }
  }
  if (info.options.edit) {
    fs.writeFileSync(info.configfile, yaml_text);
    return;
  }
  switch (info.options.list) {
  case 1:
    exec_list_option(gjson, info);
    return;
  case 2:
    return;
  }
  concat = info.options.concat;
  if (concat === 1 || concat === 2) {
    exec_cat_option(yaml_text, concat, info);
    return;
  }
  sortir = (yield* update(gjson, info));
  if (sortir === SERR) {
    return;
  }
  lconfig = sortir[0], log = sortir[1];
  if (info.options.resume) {
    lconfig = start_from_resume_point(lconfig, info);
  }
  log.dry('err', metadata.version);
  log.normal(info.options.resume, 'err_light', 'starting from resume point', c.warn(info.options.startpoint.join('.')));
  return most.generate(ms_create_watch, lconfig, info, log).recoverWith(function(sig){
    resolve_signal(sig, log, info);
    return most.empty();
  }).drain();
};
rm_resume = function(cmdline){
  var pluck, fin, i$, len$, index, each;
  pluck = -1;
  fin = cmdline;
  for (i$ = 0, len$ = cmdline.length; i$ < len$; ++i$) {
    index = i$;
    each = cmdline[i$];
    if (each === "--resume" || each === "-r") {
      pluck = index;
    }
  }
  if (pluck !== -1) {
    fin = R.remove(pluck, 1, cmdline);
  }
  return fin;
};
main = function(cmd_data){
  return function(CONF){
    var project_name, service_directory, config_file_name, wcf, cmdline, x$, info, y$, z$, archive, patt, find_fun, data, index, start_point;
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
    cmdline = R.drop(2, process.argv);
    cmdline = rm_resume(cmdline);
    x$ = info = {};
    x$.cmdname = null;
    x$.cmdargs = null;
    x$.vars = vars;
    x$.configfile = config_file_name;
    x$.timedata = [0, 0, 0];
    x$.cmdline = cmdline;
    x$.defarg = void 8;
    y$ = x$.libs = {};
    y$.emphasize = null;
    y$.boxen = null;
    z$ = x$.options = {};
    z$.verbose = cmd_data.verbose.count();
    z$.dryRun = cmd_data.dryRun.count();
    z$.watch_config_file = wcf;
    z$.list = cmd_data.list.count();
    z$.auto_make_directory = cmd_data.auto_make_directory.count();
    z$.no_watch = cmd_data.no_watch.count();
    z$.silent = silent;
    z$.edit = edit;
    z$.concat = concatenate;
    z$.project = project_name;
    z$.ssh = CONF.ssh;
    z$.rsync = CONF.rsync;
    z$.inpwd = CONF.inpwd;
    z$.watch = CONF.watch;
    z$.hist_file_address = CONF.HIST_FILE;
    z$.histsize = CONF.histsize;
    z$.resume = cmd_data.resume.count();
    z$.startpoint = [];
    if (info.options.resume) {
      archive = JSON.parse(
      R.toString(
      fs.readFileSync(
      CONF.HIST_FILE)));
      patt = info.cmdline.join(' ');
      find_fun = R.propEq(0, patt);
      data = archive[info.options.project];
      if (!data) {
        print.project_hist_empty(info.options.project, CONF.HIST_FILE);
        return;
      }
      index = R.findIndex(find_fun, data.fail);
      if (index === -1) {
        print.unable_to_find_resume(patt, data.fail);
        return;
      }
      start_point = data.fail[index][1];
      info.options.startpoint = start_point;
    }
    wait(0, function(){
      return fs.readFile(CONF.HIST_FILE, function(err, bin_data){
        var archive, e, local_hist, call, last;
        if (err) {
          c.er1(err);
          return;
        }
        try {
          archive = JSON.parse(bin_data.toString());
        } catch (e$) {
          e = e$;
          print.hist_file_corrupted(CONF.HIST_FILE);
          return;
        }
        if (!archive[project_name]) {
          local_hist = {
            call: [],
            fail: []
          };
          archive[project_name] = local_hist;
        } else {
          local_hist = archive[project_name];
        }
        call = local_hist['call'];
        if (!call) {
          print.hist_file_corrupted(CONF.HIST_FILE);
          return;
        }
        if (!info.options.list) {
          while (call.length > CONF.histsize) {
            call.shift();
          }
          last = R.last(call);
          if (last && R.equals(last[1], info.cmdline)) {
            call.pop();
          }
          call.push([new Date().getTime(), info.cmdline]);
        }
        return fs.writeFile(CONF.HIST_FILE, jspc(archive), function(err){
          if (err) {
            c.er1(err);
            return;
          }
          if (info.options.list === 2) {
            exec_list_hist(archive, info.options.project);
          }
        });
      });
    });
    if (info.options.list === 2) {
      return;
    }
    if (check_conf_file(CONF, info)) {
      return;
    }
    return most.generate(get_all, info).recoverWith(function(E){
      var str;
      str = ' [ error at line 3086 ]';
      l(c.er1(E.toString() + str));
      return most.empty();
    }).drain();
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