var reg, com, print, data, metadata, readJson, readYaml, be, hop, fs, chokidar, c, lit, spawn, l, z, j, R, co, createRsyncCmd, create_logger, cast, main, entry;
reg = require("./registry");
com = reg.com, print = reg.print, data = reg.data, metadata = reg.metadata;
readJson = com.readJson, readYaml = com.readYaml, be = com.be, hop = com.hop, fs = com.fs;
chokidar = com.chokidar, c = com.c, lit = com.lit, spawn = com.spawn;
l = com.l, z = com.z, j = com.j, R = com.R, co = com.co;
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
create_logger.prototype.full = function(show, procname, buildtxt, verbose){
  var module_name, buildname;
  buildtxt == null && (buildtxt = "");
  if (!show) {
    return;
  }
  module_name = metadata.name;
  buildname = this.buildname;
  lit(["[" + module_name + "][" + procname + "]", buildname + " ", buildtxt], [c.ok, c.warn, c.grey]);
  if (this.verbose && verbose) {
    return l("> " + verbose);
  }
};
create_logger.prototype.part = function(txt){
  if (this.verbose) {
    return l("> " + txt);
  }
};
cast = function(data, logger){
  return co(function*(){
    var i$, ref$, len$, txt, shell, disp, I, cmd, results$ = [];
    logger.full(data.localbuild.length, " localbuild ");
    for (i$ = 0, len$ = (ref$ = data.localbuild).length; i$ < len$; ++i$) {
      txt = ref$[i$];
      shell = spawn(txt);
      logger.part(txt);
      (yield fn$);
    }
    disp = data.remotehost + " " + data.remotefold;
    logger.full(data.remotetask.length, " remotetask ", disp);
    for (i$ = 0, len$ = (ref$ = data.remotetask).length; i$ < len$; ++i$) {
      I = ref$[i$];
      cmd = "ssh " + data.remotehost + " \"" + ("cd " + data.remotefold + ";") + I + "\"";
      shell = spawn(cmd);
      logger.part(cmd);
      (yield fn1$);
    }
    logger.full(data.postscript.length, " postscript ");
    for (i$ = 0, len$ = (ref$ = data.postscript).length; i$ < len$; ++i$) {
      cmd = ref$[i$];
      logger.part(cmd);
      shell = spawn(cmd);
      results$.push((yield fn2$));
    }
    return results$;
    function fn$(x){
      return shell.on('close', x);
    }
    function fn1$(x){
      return shell.on('close', x);
    }
    function fn2$(x){
      return shell.on('close', x);
    }
  });
};
main = function(data, buildname, verbose){
  var logger, G;
  logger = create_logger.of(verbose, buildname);
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
  return main(data.def, "", data.verbose);
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