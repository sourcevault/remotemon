var reg, com, print, l, z, lit, c, readJson, R, showStack, metadata, show_name, show_body, print_wrap, I, key, slice$ = [].slice, arrayFrom$ = Array.from || function(x){return slice$.call(x);};
reg = require("./registry");
com = reg.com, print = reg.print;
l = com.l, z = com.z, lit = com.lit;
c = com.c, readJson = com.readJson, R = com.R, z = com.z, showStack = com.showStack;
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
  showStack();
})(
__dirname + "/../package.json");
metadata = reg.metadata;
show_name = function(filename){
  lit(["[" + metadata.name + "]", "[dataError]\n"], [c.er2, c.er3]);
  if (filename) {
    return l("  " + c.er1(filename) + "\n");
  }
};
show_body = function(path, msg){
  var ref$, init, last, txt;
  ref$ = R.splitAt(-1, path), init = ref$[0], last = ref$[1];
  txt = ["  " + init.join("."), "." + last.join("."), " <-- error here"];
  if (msg) {
    txt.push("\n\n  " + msg, "  ");
  }
  return lit(txt, [c.warn, c.er3, c.er2, c.er1]);
};
print.unableToReadConfigYaml = function(filename){
  lit(["[" + metadata.name + "]", "[parseError]"], [c.warn, c.er1]);
  l("\n  " + c.er2(filename));
  return l(c.grey("\n", "  make sure :\n\n", "   - correct path is provided.\n", "   - .yaml file can be parsed without error.\n", "   - .yaml file has no duplicate field."));
};
print.optError = function(msg, path, filename, type){
  var itype, imsg;
  show_name(filename);
  show_body(path);
  itype = msg[0], imsg = msg[1];
  switch (itype) {
  case 2:
    lit(["\n  "].concat(arrayFrom$(imsg)), [0, c.er2, c.warn1]);
    break;
  case 1:
    lit(["\n  ", imsg], [0, c.er1]);
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
  return lit(["[" + metadata.name + "][ cmdFailure ] ", cmdname], [c.er2, c.warn]);
};
print.resError = function(props, path, filename){
  var key;
  show_name(filename);
  key = R.last(path);
  return show_body(path, [c.grey("unrecognized config key") + c.er3(" ." + key) + "\n", c.grey("only acceptable keys are :\n"), c.warn1("- " + props.join(" \n  - "))].join("\n  "));
};
print.usercmd_not_defined = function(msg, path, filename){
  show_name(filename);
  return show_body([msg], c.er3(msg + "") + " is not a valid user defined task.");
};
print.basicError = function(msg, path, filename){
  show_name(filename);
  return show_body(path, msg);
};
print_wrap = function(f){
  return function(){
    f.apply(null, arguments);
    l(c.grey("\n[docs] " + metadata.homepage));
    return showStack();
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
  return l(c.warn("[" + metadata.name + "] " + metadata.version));
};