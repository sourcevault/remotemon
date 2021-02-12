var reg, com, print, l, z, lit, j, c, readJson, R, create_stack, show_stack, metadata, show_name, show_body, print_wrap, I, key;
reg = require("./registry");
com = reg.com, print = reg.print;
l = com.l, z = com.z, lit = com.lit, j = com.j;
c = com.c, readJson = com.readJson, R = com.R, z = com.z, create_stack = com.create_stack;
show_stack = create_stack(2, []);
R.tryCatch(function(filename){
  var raw, pj;
  raw = readJson(filename);
  pj = {};
  pj.name = raw.name;
  pj.repourl = raw.repository;
  pj.homepage = raw.homepage;
  pj.version = raw.version;
  reg.metadata = pj;
}, function(){
  l(c.er2("- | unable to locate or parse package.json of module."));
  show_stack();
})(
__dirname + "/../package.json");
metadata = reg.metadata;
show_name = function(filename){
  l(lit(["[" + metadata.name + "]", "[dataError]\n"], [c.er2, c.er3]));
  if (filename) {
    return l("  " + c.er1(filename) + "\n");
  }
};
show_body = function(path, msg){
  var ref$, init, last, txt;
  ref$ = R.splitAt(-1)(
  R.drop(1, path)), init = ref$[0], last = ref$[1];
  txt = ["  " + init.join("."), "." + last.join("."), " <-- error here"];
  if (msg) {
    txt.push("\n\n  " + msg, "  ");
  }
  return lit(txt, [c.warn, c.er3, c.er2, c.pink]);
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
  lit(["[" + metadata.name + "]", "[inputError]\n"], [c.er2, c.er3]);
  return lit(["  ", "incorrect number of arguments for function."], [0, c.er1, c.er3, c.er1]);
};
print.reqError = function(props, path, filename){
  var ref$, init, last;
  show_name(filename);
  ref$ = R.splitAt(-1, path), init = ref$[0], last = ref$[1][0];
  lit(["  mandatory value " + c.er1("." + last) + " not present.\n\n", "  all mandatory value(s) :\n"], [c.grey, c.grey]);
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
  return l(show_body(path, [c.grey("unrecognized config key") + c.er3(" ." + key) + "\n", c.grey("only acceptable keys are :\n"), c.pink("- " + props.join(" \n  - "))].join("\n  ")));
};
print.usercmd_not_defined = function(msg, path, filename){
  show_name(filename);
  return l(show_body([msg], lit([msg + "", " is not a valid user defined task."], [c.er3, c.warn])));
};
print.basicError = function(msg, path, filename){
  show_name(filename);
  return l(show_body(path, msg));
};
print.no_match_for_arguments = function(){
  return lit(["[" + metadata.name + "]", "[argumentError]\n\n", "   match for arguments failed.\n\n", "   " + j(arguments)], [c.er2, c.er3, c.warn, c.pink]);
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
  return l(lit(["[" + metadata.name + "]", "[     version ]", " " + metadata.version], [c.ok, c.grey, c.grey]));
};