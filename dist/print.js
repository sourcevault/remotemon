var x$, com, y$, hoplon, child_process, print, ref$, c, l, lit, j, readJson, R, z, create_stack, show_stack, metadata, show_name, rdot, clean_path, show_body, create_logger, show, print_wrap, I, key, out$ = typeof exports != 'undefined' && exports || this;
x$ = com = {};
y$ = x$.metadata = {};
y$.name = null;
y$.repourl = null;
y$.homepage = null;
y$.version = null;
com.fs = require('fs');
com.most = require('most');
com.chokidar = require('chokidar');
com.optionator = require('optionator');
hoplon = require('hoplon');
com.hoplon = hoplon;
com.most_create = require("@most/create").create;
child_process = require('child_process');
com.child_process = child_process;
com.tampax = require('tampax');
com.updateNotifier = require('update-notifier');
com.spawn = function(cmd){
  return child_process.spawnSync(cmd, {
    shell: true,
    stdio: "inherit"
  });
};
com.exec = function(cmd){
  return child_process.execSync(cmd).toString();
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
show_stack = create_stack(2, []);
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
  show_stack();
})(
__dirname + '/../package.json');
metadata = com.metadata;
show_name = function(filename){
  l(lit(["[" + metadata.name + "]", "[dataError]\n"], [c.er2, c.er3]));
  if (filename) {
    return l("  " + c.er1(filename) + "\n");
  }
};
rdot = /\./;
clean_path = R.pipe(R.map(function(txt){
  if (rdot.exec(txt)) {
    return "\"" + txt + "\"";
  }
  return txt;
}), R.drop(1), R.splitAt(-1));
show_body = function(path, msg){
  var ref$, init, last, txt;
  ref$ = clean_path(path), init = ref$[0], last = ref$[1];
  txt = ["  " + init.join("."), "." + last.join("."), " <-- error here"];
  if (msg) {
    txt.push("\n\n " + msg, "  ");
  }
  return l(lit(txt, [c.warn, c.er3, c.er2, c.pink]));
};
print.unableToReadConfigYaml = function(filename){
  var emsg;
  l(lit(["[" + metadata.name + "]", "[parseError]"], [c.warn, c.er1]));
  l("\n  " + c.er2(filename));
  emsg = ["\n", c.pink("  make sure :\n\n"), c.blue("   - correct path is provided.\n"), c.blue("   - .yaml file can be parsed without error.\n"), c.blue("   - .yaml file has no duplicate field.")];
  return l(c.grey(emsg.join("")));
};
print.rsyncError = function(msg, path, filename, type){
  var itype, imsg;
  show_name(filename);
  l(show_body(path));
  itype = msg[0], imsg = msg[1];
  switch (itype) {
  case 'duo':
    l(lit(["\n  ", "." + imsg[0], imsg[1]], [0, c.er3, c.pink]));
    break;
  case 'uno':
    l(lit(["\n  ", imsg], [0, c.er1]));
  }
  return l(c.grey("\n  please refer to docs to provide valid values."));
};
print.incorrect_arg_num = function(){
  l(lit(["[" + metadata.name + "]", "[inputError]\n"], [c.er2, c.er3]));
  return l(lit(["  ", "incorrect number of arguments for function."], [0, c.er1, c.er3, c.er1]));
};
print.reqError = function(props, path, filename){
  var ref$, init, last;
  show_name(filename);
  ref$ = R.splitAt(-1, path), init = ref$[0], last = ref$[1][0];
  l(lit(["  mandatory value " + c.er1("." + last) + " not present.\n\n", "  all mandatory value(s) :\n"], [c.grey, c.grey]));
  return l(c.er1("  ." + props.join(" .")));
};
print.cmdError = function(cmdname){
  return l(lit(["[" + metadata.name + "][ cmdFailure ] ", cmdname], [c.er2, c.warn]));
};
print.ob_in_str_list = function(arg$, path, filename){
  var type, txt;
  type = arg$[0];
  show_name(filename);
  txt = (function(){
    switch (type) {
    case 'object':
      return "object not accepted in string list.";
    case 'empty_object':
      return "empty object found, it's likely a YAML alias referencing issue.";
    }
  }());
  return l(show_body(path, txt));
};
print.failed_in_tampex_parsing = function(filename){
  var emsg;
  l(lit(["[" + metadata.name + "]", "[parseError]"], [c.warn, c.er1]));
  l("\n  " + c.er2(filename));
  emsg = ["\n", c.pink("  yaml/tampex parsing error.")];
  return l(c.grey(emsg.join("")));
};
print.in_selected_key = function(arg$, path, filename, topmsg){
  var vname, cmd_str;
  vname = arg$[0], cmd_str = arg$[1];
  l(lit(["[" + metadata.name + "]", "[ cmdFailure ] \n"], [c.er2, c.er3]));
  l(lit(["  ." + vname, " is a selected key, cannot be used as a task name.\n"], [c.er3, c.warn]));
  return l(lit(["  ", cmd_str.join(" ")], [null, c.er1]));
};
print.resError = function(props, path, filename){
  var key;
  show_name(filename);
  key = R.last(path);
  return l(show_body(path, [c.grey("unrecognized config key") + c.er3(" " + key) + "\n", c.grey("only acceptable keys are :\n"), c.pink("- " + props.join(" \n  - "))].join("\n  ")));
};
print.usercmd_not_defined = function(msg, path, filename){
  show_name(filename);
  return l(lit(["  " + msg, " is not a valid user defined task."], [c.warn, c.er2]));
};
print.custom_build = function(msg, path, filename){
  show_name(filename);
  return l(show_body(path, [c.grey("unrecognized value provided.") + "\n", c.grey("only acceptable value types :\n"), c.pink("- array of string ( defaults to exec-locale )."), c.pink("- object with restricted keys :"), c.warn("\n  - " + data.selected_keys.arr.join("\n  - "))].join("\n ")));
};
print.basicError = function(msg, path, filename, all){
  var vals;
  vals = R.filter(function(x){
    return !(x === '');
  }, all);
  show_name(filename);
  return l(show_body(path, vals[0]));
};
print.no_match_for_arguments = function(){
  return l(lit(["[" + metadata.name + "]", "[argumentError]\n\n", "   match for arguments failed.\n\n", "   " + j(arguments)], [c.er2, c.er3, c.warn, c.pink]));
};
create_logger = function(buildname, verbose){
  var ob;
  ob = {
    buildname: buildname,
    verbose: verbose
  };
  return function(){
    return show(arguments, ob);
  };
};
show = hoplon.guard.unary.wh(function(arg$){
  var type, ref$;
  type = arg$[0];
  return (ref$ = typeof type) === 'boolean' || ref$ === 'number';
}, function(args, state){
  if (args[0]) {
    return show(R.drop(1, args), state);
  } else {}
}).ar(3, function(arg$, state){
  var type, procname, buildtxt, buildname;
  type = arg$[0], procname = arg$[1], buildtxt = arg$[2];
  buildname = state.buildname;
  switch (type) {
  case 'ok':
    procname = c.ok("[") + c.pink(procname + "") + c.ok("]");
    break;
  case 'warn':
    procname = lit(["[", procname + "", "]"], [c.pink, null, c.pink]);
    break;
  case 'no_buildname':
    buildname = "";
  }
  return l(lit(["[" + metadata.name + "]", buildname, procname + "", buildtxt], [c.ok, c.er1, c.ok, c.grey]));
}).ar(2, function(arg$, state){
  var type, txt;
  type = arg$[0], txt = arg$[1];
  switch (type) {
  case 'verbose':
    if (state.verbose) {
      return l("> " + txt);
    }
    break;
  default:
    return show([type, txt, ""], state);
  }
}).ar(1, function(arg$){
  var txt;
  txt = arg$[0];
  return l(txt);
}).def();
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
  return l(lit(["[" + metadata.name + "]", " v" + metadata.version], [c.ok, c.grey, c.grey]));
};
print.create_logger = create_logger;
print.show = function(disp, txt){
  var num;
  if (disp) {
    switch (typeof disp) {
    case 'string':
      num = parseInt(disp[0]);
      l(c.ok("[" + metadata.name + "]"), txt[num]);
      break;
    default:
      l(c.ok("[" + metadata.name + "]"), txt);
    }
  }
};