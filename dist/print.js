var x$, com, y$, most, hoplon, ref$, z, wait, most_create, child_process, readline, cp, be, R, dotpat, print, c, l, lit, j, readJson, create_stack, show_stack, metadata, show_name, rdot, clean_path, show_body, rm_empty_lines, internal, show, show_main, create_logger, print_wrap, I, key, out$ = typeof exports != 'undefined' && exports || this;
x$ = com = {};
y$ = x$.metadata = {};
y$.name = null;
y$.repourl = null;
y$.homepage = null;
y$.version = null;
com.fs = require('fs');
most = require('most');
com.most = most;
com.chokidar = require('chokidar');
hoplon = require('hoplon');
ref$ = hoplon.utils, z = ref$.z, wait = ref$.wait;
com.hoplon = hoplon;
most_create = require("@most/create").create;
com.most_create = most_create;
child_process = require('child_process');
readline = require('readline');
com.optionParser = require('option-parser');
com.tampax = require('tampax');
com.yaml = require('yaml');
com.path = require('path');
com.child_process = child_process;
cp = child_process;
be = hoplon.types;
com.readline = readline;
com.moment = require('moment');
com.compare_version = require('../dist/compare.version.js');

var boxen = import('boxen')
var emphasize =  import('emphasize/lib/all.js')

com.emphasize = emphasize;
com.boxen = boxen;
R = hoplon.utils.R;
dotpat = be.str.edit(R.split(".")).or(be.undef.cont([])).wrap();
dotpat.take = function(amount, signal){
  var sig;
  sig = dotpat(signal);
  return R.take(amount, sig).join(".");
};
com.dotpat = dotpat;
com.spawn = function(cmd, dir, inpwd){
  l(inpwd);
  return cp.spawnSync(cmd, [], {
    shell: 'bash',
    stdio: 'inherit',
    windowsVerbatimArguments: true,
    cwd: inpwd
  });
};
com.exec = function(cmd, dryRun){
  dryRun == null && (dryRun = false);
  if (!dryRun) {
    return child_process.execSync(cmd).toString();
  }
};
com.readJson = function(filename){
  return JSON.parse(
  com.hoplon.utils.R.toString(
  com.fs.readFileSync(filename)));
};
print = {};
out$.com = com;
out$.print = print;
ref$ = hoplon.utils, c = ref$.c, l = ref$.l, lit = ref$.lit, j = ref$.j, readJson = ref$.readJson, R = ref$.R, z = ref$.z, create_stack = ref$.create_stack;
show_stack = create_stack(2, ['node:internal']);
R.tryCatch(function(filename){
  var raw, pj;
  raw = com.readJson(filename);
  pj = {};
  pj.name = raw.name;
  pj.repourl = raw.repository;
  pj.homepage = raw.homepage;
  pj.version = raw.version;
  com.metadata = pj;
}, function(){
  l(c.er2("- | unable to locate or parse package.json of module."));
  show_stack(new Error());
})(
__dirname + '/../package.json');
metadata = com.metadata;
show_name = function(filename){
  filename == null && (filename = '');
  return l(lit(["[" + metadata.name + "]", " • dataError • ", filename, "\n"], [c.er3, c.er2, c.pink, null]));
};
rdot = /\./;
clean_path = R.pipe(R.map(function(txt){
  if (rdot.exec(txt)) {
    return "\"" + txt + "\"";
  }
  return txt;
}), R.splitAt(-1));
show_body = function(path, msg){
  var ref$, init, last, txt;
  ref$ = clean_path(path), init = ref$[0], last = ref$[1];
  txt = ["  " + init.join("."), "." + last.join("."), " <-- error here"];
  if (msg) {
    txt.push("\n\n  " + msg, "  ");
  }
  return lit(txt, [c.warn, c.er3, c.er2, c.er1]);
};
print.rsyncError = function(msg, path, filename){
  var itype, imsg;
  show_name(filename);
  l(show_body(path));
  itype = msg[0], imsg = msg[1];
  switch (itype) {
  case 'duo':
    l(lit(["\n  ", "." + imsg[0] + " ", imsg[1]], [0, c.er3, c.pink]));
    break;
  case 'uno':
    l(lit(["\n  ", imsg], [0, c.er1]));
  }
  return l(c.grey("\n  please refer to docs to provide valid values."));
};
rm_empty_lines = R.pipe(R.filter(function(str){
  if (str.length === 0) {
    return false;
  } else {
    return true;
  }
}));
com.rm_empty_lines = rm_empty_lines;
print.yaml_parse_fail = function(msg, info){
  var txt;
  txt = R.join('\n ')(
  rm_empty_lines(
  R.split('\n')(
  msg)));
  l(lit(["[" + metadata.name + "]", " • parseError •", " YAML file."], [c.er3, c.er3, c.er3]));
  l(lit(['\n Error in file ', info.configfile, "."], [c.er2, c.er2, c.er2]));
  return process.stdout.write('\n ' + c.warn(txt));
};
print.incorrect_arg_num = function(){
  l(lit(["[" + metadata.name + "]", " • inputError\n"], [c.er2, c.er3]));
  return l(lit(["  ", "incorrect number of arguments for function."], [0, c.er1, c.er3, c.er1]));
};
print.incorrect_custom = function(__, key){
  l(lit(["[" + metadata.name + "]", " • incorrect custom task name ", "\n"], [c.er2, c.er3, c.er2, null]));
  return l(lit(["  ", key, " <-- custom task name cannot contain", " \"/\" ", "character. "], [null, c.er3, c.er1, c.er3, c.er1]));
};
print.reqError = function(props, path, filename){
  var ref$, init, last;
  show_name(filename);
  ref$ = R.splitAt(-1, path), init = ref$[0], last = ref$[1][0];
  l(lit(["  mandatory value " + c.er1("." + last) + " not present.\n\n", "  all mandatory value(s) :\n"], [c.grey, c.grey]));
  return l(c.er1("  ." + props.join(" .")));
};
print.defarg_req = function(len){
  l(lit(["[" + metadata.name + "]", " • dataError \n"], [c.er2, c.er3]));
  return l(lit(["  command requires minimum of ", len, " commandline argument."], [c.er2, c.er3, c.er2]));
};
print.cmdError = function(cmdname){
  return l(lit(["[" + metadata.name + "] • cmdFailure • ", cmdname], [c.er2, c.warn]));
};
print.ob_in_str_list = function(type, path, filename){
  var txt;
  show_name(filename);
  txt = (function(){
    switch (type) {
    case 'object':
      return "object not accepted in string list.";
    case 'empty_object':
      return "empty object found, it could be a YAML alias referencing issue.";
    }
  }());
  return l(show_body(path, txt));
};
print.failed_in_mod_yaml = function(filename, E){
  l(lit(["[" + metadata.name + "]", " • parseError •", " unable to read YAML file."], [c.warn, c.er3, c.er1]));
  l("\n  " + c.pink(com.path.resolve(filename)));
  return l(c.er1("\n  " + E));
};
print.failed_in_tampax_parsing = function(filename, E){
  var emsg;
  l(lit(["[" + metadata.name + "]", " • parseError •", " yaml/tampex parsing error."], [c.warn, c.er2, c.er1]));
  l("\n  " + c.pink(com.path.resolve(filename)) + "\n");
  l(c.grey(E));
  emsg = ["\n", c.warn("  make sure :\n\n"), c.er1("   - YAML file(s) can be parsed without error.\n"), c.er1("   - YAML file(s) has no duplicate field.\n"), c.er1("   - YAML file(s) is not empty.\n"), c.er1("   - correct path is provided.")];
  return l(emsg.join(""));
};
print.in_selected_key = function(key, cmd_str){
  l(lit(["[" + metadata.name + "]", " • cmdFailure •\n"], [c.er2, c.er3]));
  l(lit(["  " + key, " is a selected key, cannot be used as a task name.\n"], [c.er3, c.warn]));
  return l(lit(["  ", cmd_str.join(" ")], [null, c.er1]));
};
print.error_in_user_script = function(err_msg, path){
  l(lit(["[" + metadata.name + "]", " • cmdFailure •", " error in user script.\n"], [c.er2, c.er3, c.er1]));
  l(lit(["  ", path.join("."), " <-- error here.\n"], [null, c.warn, c.er3]));
  return process.stdout.write(c.grey(err_msg));
};
print.resError = function(props, path, filename){
  var key;
  show_name(filename);
  key = R.last(path);
  return l(show_body(path, [c.grey("unrecognized config key") + c.er3(" " + key) + "\n", c.grey("only acceptable keys are :\n"), c.pink("- " + props.join(" \n  - "))].join("\n  ")));
};
print.could_not_find_custom_cmd = function(cmdname){
  l(lit(["[" + metadata.name + "]", " • dataError\n"], [c.er2, c.er3]));
  return l(lit([" unable to locate ", cmdname + "", " task in config file."], [c.er1, c.warn, c.er1]));
};
print.custom_build = function(msg, path, filename){
  show_name(filename);
  return l(show_body(path, [c.grey("unrecognized value provided.") + "\n", c.grey("only acceptable value types :\n"), c.pink("- array of string ( defaults to local )."), c.pink("- object with restricted keys :"), c.warn("\n  - " + data.selected_keys.arr.join("\n  - "))].join("\n ")));
};
print.file_does_not_exists = function(val, arg$){
  var filename, path;
  filename = arg$.filename, path = arg$.path;
  show_name(filename);
  return l(show_body(path, [c.warn(val) + c.grey(' folder/project does not exist.')]));
};
print.basicError = function(msg, path, filename){
  show_name(filename);
  return l(show_body(path, msg));
};
print.no_match_for_arguments = function(){
  return l(lit(["[" + metadata.name + "]", " • argumentError \n\n", "   match for arguments failed.\n\n", "   " + j(arguments)], [c.er2, c.er3, c.warn, c.pink]));
};
internal = {};
internal.normal = hoplon.guard.unary.wh(function(arg$){
  var type;
  type = arg$[0];
  return typeof type !== 'string';
}, function(args, state){
  if (args[0]) {
    internal.normal(R.drop(1, args), state);
  }
}).ar(1, function(arg$, state){
  var txt;
  txt = arg$[0];
  l(lit(["[" + metadata.name + "] ", txt], [c.ok, null]));
}).ar(2, function(arg$, state){
  var type, txt_1, brac_color, txt_color;
  type = arg$[0], txt_1 = arg$[1];
  switch (type) {
  case 'ok':
    brac_color = c.ok;
    txt_color = c.grey;
    break;
  case 'warn':
    brac_color = c.er1;
    txt_color = c.grey;
    break;
  case 'err':
    brac_color = c.er3;
    txt_color = c.er2;
  }
  txt_1 = lit([txt_1], [brac_color, txt_color, brac_color]);
  internal.normal([type, false, txt_1], state);
}).ar(3, function(arg$, state){
  var type, txt_1, disp, buildname, color_process_name, color_buildname_dot, color_buildname, color_finaltxt, procname, procdot;
  type = arg$[0], txt_1 = arg$[1], disp = arg$[2];
  buildname = state.buildname;
  switch (type) {
  case 'ok':
    color_process_name = c.ok;
    color_buildname_dot = c.ok;
    color_buildname = c.ok;
    color_finaltxt = c.ok;
    break;
  case 'warn':
    color_process_name = c.warn;
    color_buildname_dot = c.warn;
    color_buildname = c.warn;
    color_finaltxt = c.warn;
    break;
  case 'err':
    color_process_name = c.er3;
    color_buildname_dot = c.er3;
    color_buildname = c.er3;
    color_finaltxt = c.er2;
    break;
  case 'err_light':
    color_process_name = c.er1;
    color_buildname_dot = c.er1;
    color_buildname = c.er1;
    color_finaltxt = c.er1;
  }
  procname = color_buildname_dot(" • ") + color_buildname(txt_1);
  procdot = " •";
  if (!txt_1) {
    procname = "";
  }
  if (buildname) {
    buildname = color_buildname_dot(" • ") + color_buildname(buildname);
  } else {
    buildname = "";
  }
  return l(lit(["[" + metadata.name + "]", buildname, procname, procdot, " " + disp], [color_process_name, null, null, color_buildname_dot, color_finaltxt]));
}).ar(4, function(arg$, state){
  var type, txt_1, txt_2, txt_3;
  type = arg$[0], txt_1 = arg$[1], txt_2 = arg$[2], txt_3 = arg$[3];
  normal_internal([type, txt_1, txt_2], state);
  l(" " + txt_3);
}).def();
internal.verbose = hoplon.guard.unary.ar(2, function(arg$, state){
  var txt_1, txt_2, vl, disp;
  txt_1 = arg$[0], txt_2 = arg$[1];
  vl = state.verbose_level;
  if (vl === 1) {
    disp = txt_1.replace(/\'''/g, "'");
  } else if (vl > 1) {
    disp = txt_2.replace(/\'''/g, "'");
  } else if (vl === 0) {
    return;
  }
  return l("> " + disp);
}).ar(1, function(arg$, state){
  var txt_1, disp;
  txt_1 = arg$[0];
  if (state.verbose_level) {
    disp = txt_1.replace(/\'''/g, "'");
    return l("> " + disp);
  }
}).def();
internal.dry = hoplon.guard.unary.ar(1, function(arg$, state){
  var txt;
  txt = arg$[0];
  l(txt);
}).ar(2, function(arg$, state){
  var type, txt, color;
  type = arg$[0], txt = arg$[1];
  color = (function(){
    switch (type) {
    case 'ok':
      return c.ok;
    case 'err':
      return c.er1;
    }
  }());
  l(color("[" + metadata.name + "] " + txt));
}).def();
show = {};
show_main = function(type){
  return function(){
    if (!this.silent) {
      return internal[type](arguments, this);
    }
  };
};
show.normal = show_main('normal');
show.dry = show_main('dry');
show.verbose = function(){
  return internal.verbose(arguments, this);
};
create_logger = function(buildname, verbose, silent){
  var instance;
  instance = Object.create(show);
  instance.buildname = buildname;
  instance.verbose_level = verbose;
  instance.silent = silent;
  return instance;
};
print_wrap = function(f){
  return function(){
    f.apply(null, arguments);
    l(c.grey("\n[docs] " + metadata.homepage + "\n"));
    return show_stack(new Error());
  };
};
for (I in print) {
  key = print[I];
  if (I === 'cmdError') {
    continue;
  }
  print[I] = print_wrap(key);
}
print.showHeader = function(){
  return l(lit(["[" + metadata.name + "]", " v" + metadata.version], [c.er1, c.er1]));
};
print.create_logger = create_logger;