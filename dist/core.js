var reg, com, print, data, metadata, defsymbol, l, z, j, R, readJson, readYaml, be, hop, exec, fs, chokidar, c, lit, createRsyncCmd, create_logger, cast, main, entry;
reg = require("./registry");
com = reg.com, print = reg.print, data = reg.data, metadata = reg.metadata;
defsymbol = Symbol("default");
l = com.l, z = com.z, j = com.j, R = com.R;
readJson = com.readJson, readYaml = com.readYaml, be = com.be, hop = com.hop, exec = com.exec, fs = com.fs;
chokidar = com.chokidar, c = com.c, lit = com.lit;
createRsyncCmd = function(data){
  var rsync, str, i$, ref$, len$, I, key, cmd;
  rsync = data.rsync;
  str = "";
  for (i$ = 0, len$ = (ref$ = rsync.opt).length; i$ < len$; ++i$) {
    I = ref$[i$];
    switch (typeof I) {
    case 'string':
      str += "--" + I + " ";
      break;
    case 'object':
      key = Object.keys(I)[0];
      str += key + "=" + "\"" + I[key] + "\"" + " ";
    }
  }
  cmd = "rsync " + str + rsync.src.join(" ") + " " + (data.remotehost + ":" + data.remotefold);
  return cmd;
};
create_logger = function(verbose, buildname){
  this.verbose = verbose;
  this.buildname = buildname;
  return this;
};
create_logger.of = function(verbose, buildname){
  return new create_logger(verbose, buildname);
};
create_logger.prototype.full = function(procname, str, verb){
  var module_name, buildname;
  str == null && (str = "");
  verb == null && (verb = "");
  module_name = metadata.name;
  buildname = this.buildname;
  lit(["[" + module_name + "][" + procname + "]", buildname + " ", str], [c.ok, c.warn, c.grey]);
  if (this.verbose) {
    return l("> " + verb);
  }
};
create_logger.prototype.part = function(txt){
  if (this.verbose) {
    return l("> " + txt);
  }
};
cast = function(data, logger){
  return function(){
    var i$, ref$, len$, I, rsyncCmd, initStr, rstr, str, cmd, results$ = [];
    if (data.localbuild.length > 0) {
      logger.full(" localbuild ");
    }
    for (i$ = 0, len$ = (ref$ = data.localbuild).length; i$ < len$; ++i$) {
      I = ref$[i$];
      logger.part(I);
      try {
        l(exec(I));
      } catch (e$) {}
    }
    if (data.rsync) {
      rsyncCmd = createRsyncCmd(data);
      initStr = [data.rsync.src.join(" "), "->", data.rsync.des].join(" ");
      try {
        rstr = exec(rsyncCmd);
        logger.full("      rsync ", initStr, "> " + rsyncCmd);
        if (rstr.length > 0) {
          l(rstr);
        }
      } catch (e$) {}
    }
    str = data.remotehost + " " + data.remotefold;
    if (data.remotetask.length > 0) {
      logger.full(" remotetask ", str);
    }
    for (i$ = 0, len$ = (ref$ = data.remotetask).length; i$ < len$; ++i$) {
      I = ref$[i$];
      cmd = "ssh " + data.remotehost + " \"" + ("cd " + data.remotefold + ";") + I + "\"";
      logger.part(cmd);
      try {
        l(exec(cmd));
      } catch (e$) {}
    }
    if (data.postscript.length > 0) {
      logger.full(" postscript ");
    }
    for (i$ = 0, len$ = (ref$ = data.postscript).length; i$ < len$; ++i$) {
      cmd = ref$[i$];
      logger.part(cmd);
      try {
        results$.push(l(exec(cmd)));
      } catch (e$) {}
    }
    return results$;
  };
};
main = function(data, buildname){
  var logger, G;
  logger = create_logger.of(data.verbose, buildname);
  G = cast(data, logger);
  logger.full("   watching ", data.watch.join(" , "));
  chokidar.watch(data.watch, data.chokidar).on('change', G);
  if (data.initialize) {
    return G();
  }
};
entry = hop.wh(function(data){
  return data.cmd.length === 0;
}, function(data){
  return main(data.def, "");
}).def(function(data){
  var user, i$, ref$, len$, key, results$ = [];
  user = data.user;
  for (i$ = 0, len$ = (ref$ = data.cmd).length; i$ < len$; ++i$) {
    key = ref$[i$];
    results$.push(main(user[key], "[" + key + "]"));
  }
  return results$;
});
reg.core = entry;